import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {TokenInfo} from "./token-info";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  getAuth(): Observable<TokenInfo> {
    return new Observable(subscriber => {
      chrome.storage.sync.get(x => subscriber.next(x && x.auth));
    });
  }

  saveAuth(auth: TokenInfo) {
    return new Observable(subscriber => {
      chrome.storage.sync.set({auth}, () => subscriber.next(true));
    })
  }
}
