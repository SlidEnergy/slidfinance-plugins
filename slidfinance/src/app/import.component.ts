import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {map, tap} from "rxjs/operators";
import {supportedBanks} from "./banks/supported-banks";
import {AuthService} from "./auth/auth.service";
import {ChromeApiService} from "./chrome-api";

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  bank: { url: string, name: string, file: string };
  accountCode: string = 'tinkoff';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private chromeApi: ChromeApiService
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
    this.chromeApi.activeTab.subscribe(activeTab => {
      let tabId = activeTab.id;
      console.log('ping...');

      // Send message to check whether the script has already been injected
      chrome.tabs.sendMessage(tabId, "ping", pingResponse => {
        // If no message handler exists (i.e. content-script hasn't been injected before),
        // this callback is called right away with no arguments, so ...
        if (typeof pingResponse === "undefined") {
          console.log('inject...');
          // ... inject content-script (null means current active tab)
          this.chromeApi.executeScripts(tabId, [
              {file: 'runtime.js'},
              {file: 'utils.js'},
              {file: 'parser.js'},
              {file: './banks/' + this.bank.file}
            ],
            executeResponse => {
              let e = chrome.runtime.lastError;
              if (e !== undefined) {
                console.log(tabId, executeResponse, e);
              } else {
                console.log('export command...');
                this.exportCommand(tabId);
              }
            });
        } else {
          console.log('export command...');
          //# Register events or other stuff that send messages to the content-script
          this.exportCommand(tabId);
        }
      });
    });
  }

  exportCommand(tabId) {
    this.authService.getAuth().pipe(map(auth => auth.token))
      .subscribe(token => {
        if (!token) {
          alert("Error: Token is " + token);
          return;
        }

        console.log('export...');

        chrome.tabs.sendMessage(tabId, "export", response => {
          console.log('got response');
          if (response) {
            response = {...response, accountCode: this.accountCode};
//            sendTransactions(token, response.data);
            console.log(response);
          }
        });
      });
  }
}
