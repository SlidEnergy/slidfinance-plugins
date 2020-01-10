import {Component, NgZone, OnInit} from '@angular/core';
import {ChromeApiService} from "./chrome-api";
import {Router} from "@angular/router";
import {BankDetectorService} from "./bank-detector.service";
import {switchMapTo} from "rxjs/operators";
import {AuthService} from "./auth/auth.service";

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit {
  token = '';

  constructor(private chromeApi: ChromeApiService,
              private ngZone: NgZone,
              private router: Router,
              private bankDetector: BankDetectorService,
              private authService: AuthService) {
  }

  ngOnInit() {
  }

  button_Click() {
    if (this.token) {
      this.authService.saveRefreshToken(this.token).pipe(
        switchMapTo(this.bankDetector.detectAndNavigate())
      ).subscribe();
    }
  }
}
