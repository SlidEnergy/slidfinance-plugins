import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";
import {map, switchMap, tap} from "rxjs/operators";
import {Router} from "@angular/router";

interface TokenInfo {
  token: string,
  refreshToken: string,
  email: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'SlidFinance';

  email: string;
  supportedUrls = [
    '*://ib.homecredit.ru/*'
  ];

  constructor(
    private ngZone: NgZone,
    private changeDetector: ChangeDetectorRef,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.getAuth().pipe(
      switchMap(auth => {
        if (auth && auth.token && auth.refreshToken && auth.email)
          return of(auth);
        else
          return this.getSlidFinanceAuthData().pipe(tap(auth => this.saveAuth(auth)));
      }),
      map(auth => auth && auth.email),
    ).subscribe(email => {
      if (email) {
        this.email = email;
        this.changeDetector.detectChanges();
      }
    });

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      let activeTab = tabs[0];
      let url = activeTab.url;

      for (let regexp of this.supportedUrls) {
        let result = url.search('/' + regexp + '/');
        if (result >= 0) {
          this.navigate(['import']);
          return;
        }
      }

      this.navigate(['home']);
    });
  }

  public navigate(commands: any[]): void {
    this.ngZone.run(() => this.router.navigate(commands)).then();
  }

  getAuth(): Observable<TokenInfo> {
    return new Observable(subscriber => {
      chrome.storage.sync.get(x => subscriber.next(x && x.auth));
    });
  }

  saveAuth(auth: TokenInfo) {
    chrome.storage.sync.set({auth});
  }

  getSlidFinanceAuthData(): Observable<any> {
    return new Observable(subscriber => {
      console.log("Getting auth data...");

      // Открываем вкладку в новом окне и выполняем скрипт в созданной вкладке.

      chrome.tabs.create({
        active: false,
        url: 'https://myfinance-frontend.herokuapp.com'
      }, function (tab) {
        chrome.tabs.executeScript(tab.id, {
          code: 'localStorage.getItem("auth");'
        }, function (result: any) {
          chrome.tabs.remove(tab.id);

          let auth = undefined;
          try {
            auth = result && JSON.parse(result);
          } catch (e) {
          }

          subscriber.next(auth);
        });
      });
    });
  }
}
