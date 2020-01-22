import {Component, OnInit} from '@angular/core';
import {supportedBanks} from "./supported-banks";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  banks = supportedBanks;

  constructor() {
  }

  ngOnInit() {
  }

}
