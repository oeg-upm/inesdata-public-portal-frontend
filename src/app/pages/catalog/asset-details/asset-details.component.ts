import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataOffer } from '../../../shared/models/data-offer';
import { DomSanitizer } from '@angular/platform-browser';
import { ASSET_TYPES } from 'src/app/shared/utils/app.constants';


@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailsComponent implements OnInit {

	dataset: DataOffer;
	currentPage: number;
	pageSize: number;

  constructor(private router: Router, private sanitizer: DomSanitizer) {
		this.dataset = this.router.getCurrentNavigation().extras.state.dataset;
		this.currentPage = this.router.getCurrentNavigation().extras.state.currentPage;
		this.pageSize = this.router.getCurrentNavigation().extras.state.pageSize;
		this.dataset.properties.description = this.sanitizer.bypassSecurityTrustHtml(this.dataset.properties.description);
  }

  ngOnInit(): void {
	}

	goBack(): void {
		this.router.navigate(['/catalog'], {
      state: {
				currentPage: this.currentPage,
				pageSize: this.pageSize
			}
    });
	}

	getAssetTypeIconClass(){
		if (ASSET_TYPES.machineLearning == this.dataset.properties.assetType) {
			return 'pi-machinelearning';
		} else if (ASSET_TYPES.service == this.dataset.properties.assetType) {
			return 'pi-briefcase';
		} else {
			return 'pi-box';
		}
	}
}
