
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetDetailsComponent } from './asset-details/asset-details.component';
import { CatalogBrowserComponent } from './catalog-browser/catalog-browser.component';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: CatalogBrowserComponent },
	{ path: ':id', component: AssetDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule { }
