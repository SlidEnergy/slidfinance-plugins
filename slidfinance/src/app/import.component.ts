import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {map, switchMap, tap} from "rxjs/operators";
import {supportedBanks} from "./banks/supported-banks";
import {AuthService} from "./auth/auth.service";
import {ChromeApiService} from "./chrome-api";
import {of, throwError} from "rxjs";
import {ImportService} from "./import.service";

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  bank: { url: string, name: string, file: string };
  accountCode: string = 'tinkoff';
  message: string;
  success = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private chromeApi: ChromeApiService,
    private importService: ImportService,
    private changeDetector: ChangeDetectorRef,
  ) {

  }

  ngOnInit() {
    this.route.params.pipe(
      map(params => params['bank']),
      map(bankName => supportedBanks.find(x => x.name == bankName))
    ).subscribe(bank => {
      if (bank)
        this.bank = bank;
    });
  }

  import() {
    this.chromeApi.activeTab.pipe(
      map(activeTab => activeTab.id),
      switchMap(tabId => {
        return this.pingAndInjectContentScriptsIfRequired(tabId).pipe(
          switchMap(() => this.exportCommand(tabId))
        )
      }),
      map(response => {
        if(response && response.balance != undefined && response.transactions != undefined)
          return response;

        throwError(response);
      }),
      switchMap(data => this.importService.import(this.accountCode, data))
    )
      .subscribe(
        value => {
          this.message = "Данные успешно импортированы";
          this.success = true;
          console.log("import completed");
          this.changeDetector.detectChanges();
        },
        error => {
          this.message = error;
          this.success = false;
          console.log("import error");
          this.changeDetector.detectChanges();
        }
      );
  }

  pingAndInjectContentScriptsIfRequired(tabId: number) {
    console.log('ping...');
    // Send message to check whether the script has already been injected
    return this.chromeApi.sendMessage(tabId, "ping").pipe(
      switchMap(pingResponse => {
        // If no message handler exists (i.e. content-script hasn't been injected before),
        // this callback is called right away with no arguments, so ...
        if (typeof pingResponse === "undefined") {
          // ... inject content-script
          return this.injectContentScripts(tabId, this.bank);
        } else {
          return of(undefined);
        }
      }));
  }

  injectContentScripts(tabId, bank: { file: string }) {
    console.log('inject...');
    return this.chromeApi.executeScripts(tabId, [
      {file: 'runtime.js'},
      {file: 'utils.js'},
      {file: 'parser.js'},
      {file: './banks/' + bank.file}
    ]).pipe(map(executeResponse => {
      let e = chrome.runtime.lastError;
      if (e !== undefined) {
        console.log(tabId, executeResponse, e);
      } else {
        console.log('export command...');
        this.exportCommand(tabId);
      }
    }));
  }

  exportCommand(tabId) {
    console.log('export command...');
    return this.authService.getAuth().pipe(
      map(auth => auth.token),
      switchMap(token => {
        if (!token) {
          alert("Error: Token is " + token);
          return;
        }

        console.log('export...');
        return this.chromeApi.sendMessage(tabId, "export").pipe(tap(response => {
          console.log('got response');
        }));
      }));
  }
}
