import {Component, Input, OnInit} from '@angular/core';
import {BankAccount} from "../api";

@Component({
  selector: 'app-bank-account-list',
  templateUrl: './bank-account-list.component.html',
  styleUrls: ['./bank-account-list.component.scss']
})
export class BankAccountListComponent implements OnInit {
  @Input() accounts: BankAccount[];

  constructor() {
  }

  ngOnInit() {
  }
}
