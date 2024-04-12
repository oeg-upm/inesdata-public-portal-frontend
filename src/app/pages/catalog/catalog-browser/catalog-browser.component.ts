import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CatalogBrowserService } from "../../../shared/services/catalog-browser.service";

import { DataOffer } from 'src/app/shared/models/data-offer';



@Component({
  selector: 'app-catalog-browser',
  templateUrl: './catalog-browser.component.html',
  styleUrls: ['./catalog-browser.component.scss']
})
export class CatalogBrowserComponent implements OnInit {

  filteredDataOffers$: Observable<DataOffer[]> = of([]);
  searchText = '';

  private fetch$ = new BehaviorSubject(null);

  constructor(private apiService: CatalogBrowserService) {
  }

  ngOnInit(): void {
    this.filteredDataOffers$ = this.fetch$
      .pipe(
        switchMap(() => {
          const dataOffers$ = this.apiService.getDataOffers();
          return !!this.searchText ?
					dataOffers$.pipe(map(dataOffers => dataOffers.filter(dataOffers => dataOffers.assetId.toLowerCase().includes(this.searchText))))
            :
            dataOffers$;
        }));
  }

  onSearch() {
    this.fetch$.next(null);
  }

}
