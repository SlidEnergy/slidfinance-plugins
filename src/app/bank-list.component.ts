import {Component, Input, OnInit} from '@angular/core';
import {Bank} from "./bank";
import {NavigatorService} from "./navigator.service";
import {ChromeApiService} from "./chrome-api";

@Component({
  selector: 'app-bank-list',
  templateUrl: './bank-list.component.html',
  styleUrls: ['./bank-list.component.scss']
})
export class BankListComponent implements OnInit {
  @Input() banks: Bank[];

  constructor(private navigator: NavigatorService,
              private chromeApi: ChromeApiService) {
  }

  ngOnInit() {
  }

  row_click(row: Bank) {
    // Открываем вкладку в новом окне
    this.chromeApi.createTab({
      active: true,
      url: row.url
    }).subscribe();
  }
}
