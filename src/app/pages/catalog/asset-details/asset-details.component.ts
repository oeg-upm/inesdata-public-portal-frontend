import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataOffer } from '../../../shared/models/data-offer';
import { DomSanitizer } from '@angular/platform-browser';
import { ASSET_TYPES } from 'src/app/shared/utils/app.constants';
import { FormGroup } from '@angular/forms';
import { Vocabulary } from 'src/app/shared/models/vocabulary';


@Component({
	selector: 'app-asset-details',
	templateUrl: './asset-details.component.html',
	styleUrls: ['./asset-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetDetailsComponent implements OnInit {

	private setting = {
		element: {
			dynamicDownload: null as HTMLElement
		}
	}

	dataset: DataOffer;
	currentPage: number;
	pageSize: number;
	formValues: FormGroup[] = [];
	searchText: String = undefined;
	filterExpression: any[] = [];
	vocabulariesDefinition: Vocabulary[] = [];
	assetDataKeys: string[];
	assetDataEntries: { [key: string]: any[] } = {};
	unsanitizedDescription: string;

	constructor(private router: Router, private sanitizer: DomSanitizer) {
		this.dataset = this.router.getCurrentNavigation().extras.state.dataset;
		this.currentPage = this.router.getCurrentNavigation().extras.state.currentPage;
		this.pageSize = this.router.getCurrentNavigation().extras.state.pageSize;
		this.formValues = this.router.getCurrentNavigation().extras.state.formValues;
		this.searchText = this.router.getCurrentNavigation().extras.state.searchText;
		this.filterExpression = this.router.getCurrentNavigation().extras.state.filterExpression;
		this.vocabulariesDefinition = this.router.getCurrentNavigation().extras.state.vocabulariesDefinition;
		this.unsanitizedDescription = this.dataset.properties.description;
		this.dataset.properties.description = this.sanitizer.bypassSecurityTrustHtml(this.dataset.properties.description);
	}

	ngOnInit(): void {
		this.assetDataKeys = Object.keys(this.dataset.properties.assetData);
		this.processAssetData();
	}

	processAssetData() {
		this.assetDataKeys = this.assetDataKeys.filter(key => {
			const entries = this.getEntries(this.dataset.properties.assetData[key]);

			if (entries.length === 0) {
				return false;
			}

			this.assetDataEntries[key] = entries.map(item => ({
				key: item.key,
				value: item.value,
				isObject: this.isObject(item.value),
				isArray: this.isArray(item.value),
				entries: this.isObject(item.value) ? this.getEntries(item.value) : null
			}));

			return true;
		});
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

	getAssetTypeIconClass() {
		if (ASSET_TYPES.machineLearning == this.dataset.properties.assetType) {
			return 'pi-machinelearning';
		} else if (ASSET_TYPES.service == this.dataset.properties.assetType) {
			return 'pi-briefcase';
		} else {
			return 'pi-box';
		}
	}

	getDatasetTypeText() {
		if (ASSET_TYPES.machineLearning == this.dataset.properties.assetType) {
			return 'Machine learning';
		} else if (ASSET_TYPES.service == this.dataset.properties.assetType) {
			return 'Servicio';
		} else {
			return 'Dataset';
		}
	}

	hasDetailedInformation() {
		return this.dataset && this.dataset.properties && this.dataset.properties.assetData &&
			Object.keys(this.dataset.properties.assetData).length > 0;
	}

	getEntries(obj: any): { key: string, value: any }[] {
		return Object.entries(obj || {}).map(([key, value]) => ({ key, value }));
	}

	isObject(value: any): boolean {
		return value && typeof value === 'object' && !Array.isArray(value);
	}

	isArray(value: any): boolean {
		return Array.isArray(value);
	}

	containsOnlyObjects(array: any[]): boolean {
		return array.every(item => this.isObject(item));
	}

	dynamicDownloadAssetJson() {
		if (!this.setting.element.dynamicDownload) {
			this.setting.element.dynamicDownload = document.createElement('a');
		}
		const element = this.setting.element.dynamicDownload;
		const fileType = 'text/json';
		const jsonContent = {
			"http://www.w3.org/ns/dcat#dataset": this.dataset.originalJson,
			"@context": this.dataset.context
		}
		const jsonContentString = JSON.stringify(jsonContent, null, 2);
		element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(jsonContentString)}`);
		element.setAttribute('download', this.dataset.properties.id + '.json');

		var event = new MouseEvent("click");
		element.dispatchEvent(event);
	}
}
