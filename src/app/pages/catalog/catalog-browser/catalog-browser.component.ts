import { Component, OnInit } from '@angular/core';
import { CatalogBrowserService } from "../../../shared/services/catalog-browser.service";
import { Router } from '@angular/router';

import { DataOffer } from 'src/app/shared/models/data-offer';
import { QuerySpec } from '@think-it-labs/edc-connector-client';
import { identifierName } from '@angular/compiler';


@Component({
  selector: 'app-catalog-browser',
  templateUrl: './catalog-browser.component.html',
  styleUrls: ['./catalog-browser.component.scss']
})
export class CatalogBrowserComponent implements OnInit {

  datasets: DataOffer[];

	// Pagination
  pageSize = 10;
  currentPage = 0;
  paginatorLength = 0;

	selectedValues: string[] = [];

  constructor(private catalogService: CatalogBrowserService,
		private router: Router) {
  }

  ngOnInit(): void {
    this.loadDatasets(this.currentPage);
		console.log(this.datasets)
  }

  loadDatasets(offset: number) {
    const querySpec: QuerySpec = {
      offset: offset,
      limit: this.pageSize,
			sortField: "id",
			sortOrder: "DESC"
    }

    this.catalogService.getPaginatedDataOffers(querySpec)
      .subscribe(results => {
        this.datasets = results.datasets;
				this.paginatorLength = results.totalElements;
      });
  }

	changePage(event) {
    const offset = event.page * event.rows;
    this.pageSize = event.rows;
    this.currentPage = event.pageIndex;
    this.loadDatasets(offset);
  }

	viewDetails(dataset: DataOffer){
		this.router.navigate(['/catalog/', dataset.assetId], {
      state: { dataset: dataset }
    });
	}
}
