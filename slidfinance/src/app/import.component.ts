import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {filter, map, share, switchMap, tap} from "rxjs/operators";
import {supportedBanks} from "./supported-banks";
import {AuthService} from "./auth/auth.service";
import {ChromeApiService} from "./chrome-api";
import {of, throwError} from "rxjs";
import {ImportService} from "./import.service";
import {Bank} from "./bank";
import {AccountsService, BankAccount} from "./api";

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  bank: Bank;
  message: string;
  success = false;
  accounts: BankAccount[];
  selectedAccount: BankAccount;

  init = this.route.params.pipe(
    map(params => params['bank']),
    map(bankName => supportedBanks.find(x => x.name == bankName)),
    filter(bank => Boolean(bank)),
    tap(bank => this.bank = bank),
    share()
  );

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private chromeApi: ChromeApiService,
    private importService: ImportService,
    private changeDetector: ChangeDetectorRef,
    private accountsService: AccountsService
  ) {

  }

  ngOnInit() {
    //this.init.subscribe();

    this.init.pipe(
      switchMap(bank => {
        return this.accountsService.getList(bank.id)
      })
    ).subscribe(accounts => {
      if (accounts) {
        this.accounts = accounts;
        if (accounts.length > 0)
          this.selectedAccount = accounts[0];
      }
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
        if (response && response.balance !== undefined && response.transactions !== undefined)
          return response;

        throwError(response);
      }),
      switchMap(data => this.importService.import(this.selectedAccount.code, data))
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
      {file: './content_scripts/commons.js'},
      {file: './content_scripts/' + bank.file}
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
