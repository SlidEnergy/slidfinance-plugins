import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {switchMap} from "rxjs/operators";
import {AuthService} from "./auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  url = 'https://slidfinance-server.herokuapp.com/api/v1/import';

  constructor(private http: HttpClient,
              private authService: AuthService
  ) {
  }

  import(accountId: number, data: any[]) {
    let headers = new HttpHeaders();

    const token = AuthService.getAccessToken();
    headers = headers.set('Authorization', 'Bearer ' + token);
    headers = headers.set("Content-Type", "application/json");

    return this.http.post(this.url, {...data, accountId}, {headers: headers});
  }
}
