import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {TokenInfo} from "./token-info";
import {map, switchMap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  getAuth() {
    return this.loadAuth().pipe(
      switchMap(auth => {
        if (auth && auth.token && auth.refreshToken && auth.email)
          return of(auth);
        else
          return this.getSlidFinanceAuthData().pipe(switchMap(auth => this.saveAuth(auth).pipe(map(x => auth))));
      }));
  }

  private getSlidFinanceAuthData(): Observable<any> {
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

  private loadAuth(): Observable<TokenInfo> {
    return of(this.auth);
    // return new Observable(subscriber => {
    //   chrome.storage.sync.get(x => subscriber.next(x && x.auth));
    // });
  }

  private saveAuth(auth: TokenInfo) {
    this.auth = auth;
    return of(true);

    // return new Observable(subscriber => {
    //   chrome.storage.sync.set({auth}, () => subscriber.next(true));
    // });
  }

  auth: TokenInfo
}
