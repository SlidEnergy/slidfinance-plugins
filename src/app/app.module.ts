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
import { BankAccountListComponent } from './import/bank-account-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {MatListModule} from "@angular/material/list";
import {AuthGuard} from "./auth/auth-guard.service";
import {MatButtonModule} from "@angular/material/button";
import { TokenComponent } from './token.component';
import {MatInputModule} from "@angular/material/input";
import {BankListComponent} from "./bank-list.component";
import { StorageModule } from '@ngx-pwa/local-storage';

@NgModule({
  declarations: [
    AppComponent,
    ImportComponent,
    HomeComponent,
    BankAccountListComponent,
    TokenComponent,
    BankListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ApiModule.forRoot(apiConfigFactory),
    NoopAnimationsModule,

    MatListModule,
    MatButtonModule,
    MatInputModule,
    StorageModule.forRoot({ IDBNoWrap: true }),
  ],
  providers: [
    ImportService,
    AuthService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
