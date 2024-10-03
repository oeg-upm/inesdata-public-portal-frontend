import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataOffer } from '../../../shared/models/data-offer';
import { DomSanitizer } from '@angular/platform-browser';
import { ASSET_TYPES } from 'src/app/shared/utils/app.constants';
import { FormGroup } from '@angular/forms';
import { Vocabulary } from 'src/app/shared/models/vocabulary';
import { QuerySpec } from '@think-it-labs/edc-connector-client';
import { CatalogBrowserService } from 'src/app/shared/services/catalog-browser.service';
import { BehaviorSubject, switchMap } from 'rxjs';


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

	private datasetSubject = new BehaviorSubject<DataOffer | null>(null);
  dataset$ = this.datasetSubject.asObservable();
  currentPage: number;
  pageSize: number;
  formValues: FormGroup[] = [];
  searchText: string = undefined;
  filterExpression: any[] = [];
  vocabulariesDefinition: Vocabulary[] = [];
  assetDataKeys: string[];
  assetDataEntries: { [key: string]: any[] } = {};
  unsanitizedDescription: string;
  queryParams: any;
	isNavigation: boolean = false;

  constructor(private router: Router,
              private sanitizer: DomSanitizer,
              private activatedRoute: ActivatedRoute,
              private catalogService: CatalogBrowserService) {
								if (this.router.getCurrentNavigation()?.extras.state) {
									this.isNavigation = true;
									this.currentPage = this.router.getCurrentNavigation().extras.state.currentPage;
									this.pageSize = this.router.getCurrentNavigation().extras.state.pageSize;
									this.formValues = this.router.getCurrentNavigation().extras.state.formValues;
									this.searchText = this.router.getCurrentNavigation().extras.state.searchText;
									this.filterExpression = this.router.getCurrentNavigation().extras.state.filterExpression;
									this.vocabulariesDefinition = this.router.getCurrentNavigation().extras.state.vocabulariesDefinition;
								}
							}

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(
      switchMap(params => {
        const participantId = String(params.get('participantId'));
        const datasetId = String(params.get('datasetId'));
        return this.loadDataset(participantId, datasetId);
      })
    ).subscribe();
  }

  loadDataset(participantId: any, datasetId: any) {
    const querySpec: QuerySpec = {
      offset: 0,
      limit: 1,
      sortField: "id",
      sortOrder: "ASC",
      filterExpression: [
        {
          operandLeft: "id",
          operator: "=",
          operandRight: datasetId
        },
        {
          operandLeft: "'properties'.'https://w3id.org/edc/v0.0.1/ns/participantId'",
          operator: "=",
          operandRight: participantId
        }
      ]
    };

    return this.catalogService.getPaginatedDataOffers(querySpec).pipe(
      switchMap(results => {
        const dataset = results.datasets[0];
        this.datasetSubject.next(dataset);
        this.assetDataKeys = Object.keys(dataset.properties.assetData);
        this.processAssetData(dataset);
				this.unsanitizedDescription = dataset.properties.description;
        return [];
      })
    );
  }

  processAssetData(dataset: DataOffer) {
    this.assetDataKeys = this.assetDataKeys.filter(key => {
      const entries = this.getEntries(dataset.properties.assetData[key]);

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

	getAssetTypeIconClass(dataset: DataOffer) {
		if (ASSET_TYPES.machineLearning == dataset.properties.assetType) {
			return 'pi-machinelearning';
		} else if (ASSET_TYPES.service == dataset.properties.assetType) {
			return 'pi-briefcase';
		} else {
			return 'pi-box';
		}
	}

	getDatasetTypeText(dataset: DataOffer) {
		if (ASSET_TYPES.machineLearning == dataset.properties.assetType) {
			return 'Machine learning';
		} else if (ASSET_TYPES.service == dataset.properties.assetType) {
			return 'Servicio';
		} else {
			return 'Dataset';
		}
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

	dynamicDownloadAssetJson(dataset: DataOffer) {
		if (!this.setting.element.dynamicDownload) {
			this.setting.element.dynamicDownload = document.createElement('a');
		}
		const element = this.setting.element.dynamicDownload;
		const fileType = 'text/json';
		const jsonContent = {
			"http://www.w3.org/ns/dcat#dataset": dataset.originalJson,
			"@context": dataset.context
		}
		const jsonContentString = JSON.stringify(jsonContent, null, 2);
		element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(jsonContentString)}`);
		element.setAttribute('download', dataset.properties.id + '.json');

		var event = new MouseEvent("click");
		element.dispatchEvent(event);
	}

	sanitazedDescription(description: string){
		return this.sanitizer.bypassSecurityTrustHtml(description)
	}
}
