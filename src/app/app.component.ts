import {Component, OnInit} from '@angular/core';
import {filter, switchMapTo, tap} from "rxjs/operators";
import {ChromeApiService} from "./chrome-api";
import {NavigatorService} from "./navigator.service";
import {BankDetectorService} from "./bank-detector.service";
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
    private chromeApi: ChromeApiService,
    private navigator: NavigatorService,
    private bankDetector: BankDetectorService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.authService.hasRefreshToken().pipe(
      tap(token => {
        if(!token)
          this.navigator.navigate(['token'])
      }),
      filter(token => token),
      switchMapTo(this.authService.initAccessToken()),
      switchMapTo(this.bankDetector.detectAndNavigate()),
    ).subscribe();
  }
}
