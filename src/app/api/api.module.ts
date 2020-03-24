import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { AccountsService } from './api/accounts.service';
import { BanksService } from './api/banks.service';
import { CategoriesService } from './api/categories.service';
import { ImportService } from './api/import.service';
import { MccService } from './api/mcc.service';
import { MerchantsService } from './api/merchants.service';
import { ProductsService } from './api/products.service';
import { RulesService } from './api/rules.service';
import { StatisticsService } from './api/statistics.service';
import { TelegramService } from './api/telegram.service';
import { TokenService } from './api/token.service';
import { TransactionsService } from './api/transactions.service';
import { UsersService } from './api/users.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    AccountsService,
    BanksService,
    CategoriesService,
    ImportService,
    MccService,
    MerchantsService,
    ProductsService,
    RulesService,
    StatisticsService,
    TelegramService,
    TokenService,
    TransactionsService,
    UsersService ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
