import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {filter, map, switchMap, tap} from "rxjs/operators";
import {ChromeApiService} from "../chrome-api";
import {ImportService, TokensCortage} from "../api";
import {NavigatorService} from "../navigator.service";
import local = chrome.storage.local;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private chromeApi: ChromeApiService,
              private importService: ImportService,
              private navigator: NavigatorService) {
  }

  initAccessToken() {
    return this.chromeApi.getSyncStorage().pipe(
      switchMap(data => {
        const accessToken = AuthService.getAccessToken();
        if (accessToken)
          return of(accessToken);

        console.log('refresh token...');
        console.log(data.refreshToken);
        return this.refreshToken(data.refreshToken);
      }),
      tap(accessToken => localStorage.setItem('accessToken', accessToken))
    );
  }

  hasRefreshToken() {
    return this.chromeApi.getSyncStorage().pipe(
      map(data => data && data.refreshToken)
    );
  }

  get isLoggedIn(): Observable<boolean> {
    return of(AuthService.getAccessToken()).pipe(
      map(token => Boolean(token))
    );
  }

  static getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  saveRefreshToken(token: string) {
    return this.chromeApi.setSyncStorage({refreshToken: token});
  }

  private refreshToken(token: string): Observable<string> {
    if (!token)
      return of(undefined);

    return this.importService.refresh({refreshToken: token}).pipe(
      switchMap(tokens => this.chromeApi.setSyncStorage({
            refreshToken: tokens.refreshToken
          }).pipe(map(result => tokens.token))
      ),
    );
  }
}
