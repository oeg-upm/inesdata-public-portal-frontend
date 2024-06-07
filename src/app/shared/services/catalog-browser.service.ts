import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, reduce } from 'rxjs/operators';
import { Catalog } from '../models/catalog';
import { ContractOffer } from '../models/contract-offer';
import { DataOffer } from '../models/data-offer';


import { PolicyInput } from "../models/edc-connector-entities";
import { environment } from 'src/environments/environment';



/**
 * Combines several services that are used from the {@link CatalogBrowserComponent}
 */
@Injectable({
	providedIn: 'root'
})
export class CatalogBrowserService {


  private readonly BASE_URL = `${environment.runtime.strapiUrl}`;
  private readonly CATALOG_URL = `${environment.runtime.service.strapi.getFederatedCatalog}`;

	constructor(private httpClient: HttpClient) {
	}

	getDataOffers(): Observable<DataOffer[]> {
		return this.get<Catalog[]>(`${this.BASE_URL}${this.CATALOG_URL}`)
			.pipe(map(catalogs => catalogs.map(catalog => {
				const arr = Array<DataOffer>();
				let datasets = catalog["http://www.w3.org/ns/dcat#dataset"];
				if (!Array.isArray(datasets)) {
					datasets = [datasets];
				}

				for (const dataset of datasets) {
					const properties: { [key: string]: string; } = {
						id: dataset["id"],
						name: dataset["name"],
						version: dataset["version"],
						type: dataset["type"],
						contentType: dataset["contenttype"]
					}
					const assetId = dataset["@id"];

					const hasPolicy = dataset["odrl:hasPolicy"];
					const contractOffers = Array<ContractOffer>();

					if (Array.isArray(hasPolicy)) {
						for (const offer of hasPolicy) {
							const policy = this.createPolicy(offer);
							const newContractOffer = this.createContractOffer(assetId, offer["@id"], policy);
							contractOffers.push(newContractOffer);
						}
					} else {
						const policy = this.createPolicy(hasPolicy);
						const newContractOffer = this.createContractOffer(assetId, hasPolicy["@id"], policy);
						contractOffers.push(newContractOffer);
					}

					const dataOffer = {
						assetId: assetId,
						properties: properties,
						"dcat:dataset": datasets,
						service: catalog["http://www.w3.org/ns/dcat#service"],
						contractOffers: contractOffers,
						originator: catalog["originator"],
					}

					arr.push(dataOffer);
				}
				return arr;
			})), reduce((acc, val) => {
				for (const subArray of val) {
					for (const item of subArray) {
						acc.push(item);
					}
				}
				return acc;
			}, new Array<DataOffer>()));
	}

	private createContractOffer(assetId: string, id: string, policy: PolicyInput): ContractOffer {
		return {
			assetId: assetId,
			id: id,
			policy: policy
		};
	}

	private createPolicy(offer: any): PolicyInput {
		return {
			"@type": "set",
			"@context": "http://www.w3.org/ns/odrl.jsonld",
			"uid": offer["@id"],
			"assignee": offer["assignee"],
			"assigner": offer["assigner"],
			"obligation": offer["odrl:obligations"],
			"permission": offer["odrl:permissions"],
			"prohibition": offer["odrl:prohibitions"],
			"target": offer["odrl:target"]
		};
	}

	private get<T>(urlPath: string,
		params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>; })
		: Observable<T> {
		const url = `${urlPath}`;
		let headers = new HttpHeaders({ "Content-type": "application/json" });
		return this.catchError(this.httpClient.get<T>(url, { headers, params }), url, 'GET');
	}

	private catchError<T>(observable: Observable<T>, url: string, method: string): Observable<T> {
		return observable
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					if (httpErrorResponse.error instanceof Error) {
						console.error(`Error accessing URL '${url}', Method: 'GET', Error: '${httpErrorResponse.error.message}'`);
					} else {
						console.error(`Unsuccessful status code accessing URL '${url}', Method: '${method}', StatusCode: '${httpErrorResponse.status}', Error: '${httpErrorResponse.error?.message}'`);
					}

					return EMPTY;
				}));
	}
}
