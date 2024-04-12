import { Component } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { DataOffer } from 'src/app/shared/models/data-offer';
import { LandingPage } from 'src/app/shared/models/landing-page';
import { LandingPageService } from '../../shared/services/landing-page.service';
import { CatalogBrowserService } from '../../shared/services/catalog-browser.service';

/**
 * Home component
 */
@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent {

	landingPageContent$: Observable<LandingPage>;
	dataOffers$: Observable<DataOffer[]>;
	private fetch$ = new BehaviorSubject(null);
background: any;

	/**
	 * Component constructor
	 */
	constructor(private landingPageService: LandingPageService,
		private catalogService: CatalogBrowserService) { }

	ngOnInit() {
		this.landingPageContent$ = this.fetch$
			.pipe(
				switchMap(() => {
					return this.landingPageService.getLandingPageContent();
				}));


		this.dataOffers$ = this.fetch$
			.pipe(
				switchMap(() => {
					return this.catalogService.getDataOffers();
				}));
	}

}
