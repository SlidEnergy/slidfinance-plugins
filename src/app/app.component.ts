import {Component, OnInit} from '@angular/core';
import {filter, map, switchMap, tap} from "rxjs/operators";
import {ChromeApiService} from "./chrome-api";
import {NavigatorService} from "./navigator.service";
import {BankDetectorService} from "./bank-detector.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'SlidFinance';
  email: string;

  constructor(
    private chromeApi: ChromeApiService,
    private navigator: NavigatorService,
    private bankDetector: BankDetectorService
  ) {
  }

  ngOnInit() {
    this.chromeApi.getSyncStorage().pipe(
      map(data => data.token),
      tap(token => {
        if(!token)
          this.navigator.navigate(['token'])
      }),
      filter(token => token),
      switchMap(token => this.bankDetector.detectAndNavigate()),
    ).subscribe();
  }
}
