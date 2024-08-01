import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataOffer } from '../../../shared/models/data-offer';
import { DomSanitizer } from '@angular/platform-browser';
import { ASSET_TYPES } from 'src/app/shared/utils/app.constants';
import { FormGroup } from '@angular/forms';
import { Vocabulary } from 'src/app/shared/models/vocabulary';


@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailsComponent implements OnInit {

	dataset: DataOffer;
	currentPage: number;
	pageSize: number;
	formValues: FormGroup[] = [];
	searchText: String = undefined;
	filterExpression: any[] = [];
	vocabulariesDefinition: Vocabulary[] = [];

  constructor(private router: Router, private sanitizer: DomSanitizer) {
		this.dataset = this.router.getCurrentNavigation().extras.state.dataset;
		this.currentPage = this.router.getCurrentNavigation().extras.state.currentPage;
		this.pageSize = this.router.getCurrentNavigation().extras.state.pageSize;
		this.formValues = this.router.getCurrentNavigation().extras.state.formValues;
		this.searchText = this.router.getCurrentNavigation().extras.state.searchText;
		this.filterExpression = this.router.getCurrentNavigation().extras.state.filterExpression;
		this.vocabulariesDefinition = this.router.getCurrentNavigation().extras.state.vocabulariesDefinition;
		this.dataset.properties.description = this.sanitizer.bypassSecurityTrustHtml(this.dataset.properties.description);
  }

  ngOnInit(): void {
	}

	goBack(): void {
		this.router.navigate(['/catalog'], {
      state: {
				currentPage: this.currentPage,
				pageSize: this.pageSize,
				formValues: this.formValues,
				searchText: this.searchText,
				filterExpression: this.filterExpression,
				vocabulariesDefinition: this.vocabulariesDefinition
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
