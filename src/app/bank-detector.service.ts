import {Injectable, NgZone} from '@angular/core';
import {Router} from "@angular/router";
import {tap} from "rxjs/operators";
import {ChromeApiService} from "./chrome-api";
import {supportedBanks} from "./supported-banks";
import {NavigatorService} from "./navigator.service";

@Injectable({
  providedIn: 'root'
})
export class BankDetectorService {

  constructor(private ngZone: NgZone,
              private router: Router,
              private chromeApi: ChromeApiService,
              private navigator: NavigatorService) {
  }

  public detectAndNavigate() {
    return this.chromeApi.activeTab.pipe(
      tap(activeTab => {
        const url = activeTab.url;

        const bank = this.getBank(url);

        if (bank && bank.name)
          this.navigator.navigate(['import', bank.name]);
        else
          this.navigator.navigate(['home']);
      })
    );
  }

  getBank(url: string) {
    for (let bank of supportedBanks) {
      let result = url.indexOf(bank.url);
      if (result >= 0) {
        this.navigator.navigate(['import', bank.name]);
        return bank;
      }
    }

    return undefined;
  }
}
