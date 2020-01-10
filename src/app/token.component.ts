import {Component, NgZone, OnInit} from '@angular/core';
import {ChromeApiService} from "./chrome-api";
import {Router} from "@angular/router";
import {BankDetectorService} from "./bank-detector.service";
import {switchMapTo} from "rxjs/operators";

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
              private bankDetector: BankDetectorService) {
  }

  ngOnInit() {
  }

  button_Click() {
    console.log(this.token);
    if (this.token) {
      this.chromeApi.setSyncStorage({token: this.token}).pipe(
        switchMapTo(this.bankDetector.detectAndNavigate())
      ).subscribe();
    }
  }
}
