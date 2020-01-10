import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ChromeApiService} from "../chrome-api";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private chromeApi: ChromeApiService) { }

  get isLoggedIn(): Observable<boolean> {
    return this.getToken().pipe(
      map(token => Boolean(token))
    );
  }

  getToken() {
    return this.chromeApi.getSyncStorage().pipe(
      map(data => data.token)
    );
  }
}
