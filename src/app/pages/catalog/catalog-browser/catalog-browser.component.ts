import { Component, OnInit, ViewChild } from '@angular/core';
import { CatalogBrowserService } from "../../../shared/services/catalog-browser.service";
import { Router } from '@angular/router';

import { DataOffer } from 'src/app/shared/models/data-offer';
import { QuerySpec } from '@think-it-labs/edc-connector-client';
import { ASSET_TYPES } from 'src/app/shared/utils/app.constants';


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
	offset = 0;

	selectedValues: string[] = [];

  constructor(private catalogService: CatalogBrowserService,
		private router: Router) {
			const navigation = this.router.getCurrentNavigation();
			if(navigation.previousNavigation && navigation?.extras?.state){
				this.currentPage = navigation.extras.state.currentPage;
				this.pageSize = navigation.extras.state.pageSize;
			}
  }

  ngOnInit(): void {
		this.offset = this.currentPage * this.pageSize;
    this.loadDatasets();
  }

  loadDatasets() {
    const querySpec: QuerySpec = {
      offset: this.offset,
      limit: this.pageSize,
			sortField: "id",
			sortOrder: "ASC"
    }

    this.catalogService.getPaginatedDataOffers(querySpec)
      .subscribe(results => {
        this.datasets = results.datasets;
				this.paginatorLength = results.totalElements;
      });
  }

	changePage(event) {
    this.offset = event.page * event.rows;
    this.pageSize = event.rows;
    this.currentPage = event.page;
    this.loadDatasets();
  }

	viewDetails(dataset: DataOffer){
		this.router.navigate(['/catalog/', dataset.assetId], {
      state: {
				dataset: dataset,
				currentPage: this.currentPage,
				pageSize: this.pageSize
			}
    });
	}

	getAssetTypeIconClass(assetType: string){
		if (ASSET_TYPES.machineLearning == assetType) {
			return 'pi-machinelearning';
		} else if (ASSET_TYPES.service == assetType) {
			return 'pi-briefcase';
		} else {
			return 'pi-box';
		}
	}
}
