import { Component, OnInit, ViewChild } from '@angular/core';
import { CatalogBrowserService } from "../../../shared/services/catalog-browser.service";
import { Router } from '@angular/router';

import { DataOffer } from 'src/app/shared/models/data-offer';
import { QuerySpec } from '@think-it-labs/edc-connector-client';
import { ASSET_TYPES } from 'src/app/shared/utils/app.constants';
import { VocabulariesService } from 'src/app/shared/services/vocabularies.service';
import { Vocabulary } from 'src/app/shared/models/vocabulary';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


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
	vocabulariesDefinition: Vocabulary[] = [];

  forms: FormGroup[] = [];

	schemas: any[]=[];
  allFormValues: any[] = [];
	searchText: String = undefined

  constructor(private catalogService: CatalogBrowserService, private vocabulariesService: VocabulariesService,
		private router: Router,private fb: FormBuilder) {
			const navigation = this.router.getCurrentNavigation();
			if(navigation.previousNavigation && navigation?.extras?.state){
				this.currentPage = navigation.extras.state.currentPage;
				this.pageSize = navigation.extras.state.pageSize;
			}
  }

  ngOnInit(): void {
		this.offset = this.currentPage * this.pageSize;
    this.loadDatasets([]);
		this.loadVocabulariesDefinition();
  }

	loadVocabulariesDefinition(){
		this.vocabulariesService.getVocabularies()
		.subscribe(results => {
			this.vocabulariesDefinition = results;
			this.vocabulariesDefinition.forEach(schema => {
				const form = this.fb.group({});
				const jschema = JSON.parse(schema['jsonSchema'])
				this.schemas.push(jschema)
				this.buildForm(jschema.properties,form)
				this.forms.push(form);
				this.allFormValues.push(form.value);
			});
		});
	}

  loadDatasets(filterExpression: any[]) {
    const querySpec: QuerySpec = {
      offset: this.offset,
      limit: this.pageSize,
			sortField: "id",
			sortOrder: "ASC",
			filterExpression: filterExpression
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
    this.loadDatasets([]);
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

	buildForm(properties: any,form: FormGroup, parentKey?: string): void {
    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        const property = properties[key];
        const controlKey = parentKey ? `${parentKey}.${key}` : key;
        if (property.type === 'object') {
          this.buildForm(property.properties,form, controlKey);
        }  else if (property.type === 'array' && property.items.type === 'object') {
          this.buildForm(property.items.properties,form, controlKey);
        } else {
          const controlName = property.title || key.split(':').pop();
          const validators = property.type === 'array' ? [] : [Validators.required];
          form.addControl(controlKey, new FormControl('', validators));
        }
      }
    }
  }


  onBlur(): void {
    this.allFormValues = this.forms.map(form => form.value);
  }

	getKeys(obj: any): string[] {
		return Object.keys(obj);
	}

	getType(format: string): string {
		switch (format) {
			case 'date':
				return 'date';
			default:
				return 'text';
		}
	}

	search(){
		console.log(this.searchText)
		console.log(this.allFormValues)
		this.loadDatasets(this.createSearchRequest())
	}


	createSearchRequest(){
		let request:any=[]
		if(this.searchText){
			request.push({
				operandLeft: "genericSearch",
				operator: "LIKE",
				operandRight: `%${this.searchText}%`
			})
		}
		return request;
	}
}
