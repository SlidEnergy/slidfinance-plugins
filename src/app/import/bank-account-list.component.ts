import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BankAccount} from "../api";
import {MatSelectionListChange} from "@angular/material/list";

@Component({
  selector: 'app-bank-account-list',
  templateUrl: './bank-account-list.component.html',
  styleUrls: ['./bank-account-list.component.scss']
})
export class BankAccountListComponent implements OnInit {
  @Input() accounts: BankAccount[];
  @Input("selectedItem") set selectedItem(value: BankAccount) {
    if(value)
      this.selectedOptions = [value];
  }
  @Output() selectedItemChange = new EventEmitter<BankAccount>()

  selectedOptions: BankAccount[] = [];

  constructor() {
  }

  ngOnInit() {
  }

  list_selectionChange(event: MatSelectionListChange) {
    // если элемент был выбран и с него сняли выделение
    if(!event.option.selected) {
      event.option._setSelected(true);
    } else {
      // если выбрали другой элемент
      event.source.deselectAll();
      event.option._setSelected(true);
      this.selectedItemChange.emit(event.option.value);
    }
  }
}
