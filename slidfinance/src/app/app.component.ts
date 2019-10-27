import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";
import {map, switchMap, tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {supportedBanks} from "src/app/banks/supported-banks";
import {AuthService} from "./auth/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'SlidFinance';
  email: string;

  constructor(
    private ngZone: NgZone,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.authService.getAuth().pipe(
      switchMap(auth => {
        if (auth && auth.token && auth.refreshToken && auth.email)
          return of(auth);
        else
          return this.getSlidFinanceAuthData().pipe(switchMap(auth => this.authService.saveAuth(auth).pipe(map(x => auth))));
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

      for (let bank of supportedBanks) {
        let result = url.indexOf(bank.url);
        if (result >= 0) {
          this.navigate(['import', bank.name]);
          return;
        }
      }

      this.navigate(['home']);
    });
  }

  public navigate(commands: any[]): void {
    this.ngZone.run(() => this.router.navigate(commands)).then();
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
