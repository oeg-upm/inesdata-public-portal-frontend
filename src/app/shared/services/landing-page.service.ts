import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LandingPage } from '../models/landing-page';

import { LANDING_PAGE_API } from "../utils/app.constants";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Service to get the landing page content from the Strapi API
 */
@Injectable({
	providedIn: 'root'
})
export class LandingPageService {

	constructor(private httpClient: HttpClient,
		@Inject(LANDING_PAGE_API) private landingPageApiUrl: string) {
	}

	getLandingPageContent(): Observable<LandingPage> {
		const baseUrl = new URL(this.landingPageApiUrl).origin;
		return this.httpClient.get<any>(this.landingPageApiUrl).pipe(
			map((response: any) => {
				const landingPage = {
					title: response['data']['attributes']['Title'],
					welcomeBlock: {
						text: response['data']['attributes']['Welcome']['Text'],
						buttonText: response['data']['attributes']['Welcome']['ButtonText'],
						backgroundImageUrl: baseUrl + response['data']['attributes']['Welcome']['Image']['data']['attributes']['url']
					},
					catalogBlock: {
						title: response['data']['attributes']['Catalog']['Title'],
						description: response['data']['attributes']['Catalog']['Description'],
						backgroundImageUrl: baseUrl + response['data']['attributes']['Catalog']['Background']['data']['attributes']['url'],
						buttonText: response['data']['attributes']['Catalog']['ButtonText']
					},
					getToKnowUsBlock: {
						title: response['data']['attributes']['GetToKnowUs']['Title'],
						description: response['data']['attributes']['GetToKnowUs']['Description'],
						backgroundImageUrl: baseUrl + response['data']['attributes']['GetToKnowUs']['Background']['data']['attributes']['url']
					},
					joinBlock: {
						title: response['data']['attributes']['Join']['Title'],
						description: response['data']['attributes']['Join']['Description'],
						imageUrl: baseUrl + response['data']['attributes']['Join']['Image']['data']['attributes']['url'],
						buttonText: response['data']['attributes']['Join']['ButtonText']
					}
				}
				return landingPage;
			})
		);
	}
}
