import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {map, switchMap} from "rxjs/operators";
import {AuthService} from "./auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  url = 'https://myfinance-server.herokuapp.com/api/v1/import';

  constructor(private http: HttpClient,
              private authService: AuthService
  ) {
  }

  import(accountCode: string, data: any[]) {
    let headers = new HttpHeaders();

    return this.authService.getAuth().pipe(
      map(auth => auth && auth.token),
      switchMap(token => {

        headers = headers.set('Authorization', 'Bearer ' + token);
        headers = headers.set("Content-Type", "application/json");

        return this.http.post(this.url, {...data, code: accountCode}, {headers: headers});
      }));
  }
}
