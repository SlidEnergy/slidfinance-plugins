import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";
import {map, switchMap, tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {supportedBanks} from "src/app/banks/supported-banks";
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
    private ngZone: NgZone,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.authService.getAuth().pipe(
      map(auth => auth && auth.email),
    ).subscribe(email => {
      if (email) {
        this.email = email;
        this.changeDetector.detectChanges();
      }
    });

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      let activeTab = tabs[0];
      let url = activeTab.url;

      for (let bank of supportedBanks) {
        let result = url.indexOf(bank.url);
        if (result >= 0) {
          this.navigate(['import', bank.name]);
          return;
        }
      }

      this.navigate(['home']);
    });
  }

  public navigate(commands: any[]): void {
    this.ngZone.run(() => this.router.navigate(commands)).then();
  }


}
