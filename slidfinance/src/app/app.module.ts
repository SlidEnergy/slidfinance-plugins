import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ImportComponent} from './import.component';
import {HomeComponent} from './home.component';
import {ImportService} from "./import.service";
import {AuthService} from "./auth/auth.service";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {ApiModule} from "./api";
import {apiConfigFactory} from "./api-config-factory";
import { BankAccountsComponent } from './import/bank-accounts/bank-accounts.component';
import { BankAccountListComponent } from './import/bank-account-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    ImportComponent,
    HomeComponent,
    BankAccountsComponent,
    BankAccountListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ApiModule.forRoot(apiConfigFactory),
    NoopAnimationsModule,
  ],
  providers: [
    ImportService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
