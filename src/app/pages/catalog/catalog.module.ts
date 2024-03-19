import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogRoutingModule } from './catalog-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';

import { CatalogBrowserComponent } from './catalog-browser/catalog-browser.component';

@NgModule({
  declarations: [
    CatalogBrowserComponent
  ],
  imports: [
    CommonModule,
    CatalogRoutingModule,
		CardModule,
		TranslateModule
  ]
})
export class CatalogModule { }
