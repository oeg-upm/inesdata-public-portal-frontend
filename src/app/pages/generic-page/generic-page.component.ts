import { Component, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { GenericPageService } from '../../shared/services/generic-page.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { MenuService } from '../../shared/services/menu.service';
import { LoadMenuStatusService } from 'src/app/shared/services/load-menu-status.service';
import { of } from 'rxjs';

@Component({
	selector: 'app-generic-page',
	templateUrl: './generic-page.component.html',
	styleUrls: ['./generic-page.component.scss']
})
export class GenericPageComponent implements OnInit {

	title: string;
	content: string;
	id: string;
	menu: any;
	slug: string;

	@ViewChild('contentContainer', { static: true }) contentContainer: ElementRef;

	constructor(
		private genericPageService: GenericPageService,
		private activatedRoute: ActivatedRoute,
		private renderer: Renderer2,
		private router: Router,
		private menuService: MenuService,
		private loadStatusService: LoadMenuStatusService
	) { }

	ngOnInit() {

		this.activatedRoute.paramMap.pipe(
			switchMap(params => {
				this.slug = String(params.get('title'));
				return of(null);
			})
		).subscribe();

		this.loadStatusService.loadStatus$.subscribe((loaded: boolean) => {
			if (loaded) {
				this.getContentByUrl();
			}
		});

		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe(() => {
			this.getContentByUrl();
		});

	}
	getContentByUrl() {
		this.menu = this.menuService.mainMenu;

		if (!this.menu || this.menu.length === 0) {
			return of(null);
		}

		const selectedMenuItem = this.menu.find(element => element.slug && element.slug.toLowerCase() === this.slug.toLowerCase());

		if (selectedMenuItem) {
			const id = selectedMenuItem.id;
			return this.loadGenericPage(id);
		}
	}

	loadGenericPage(id: string) {
		this.genericPageService.getGenericPageContent(id)
			.subscribe(result => {
				this.title = result.title;

				const htmlContent = result.content.replace(/\n/g, '');

				this.injectHTML(htmlContent);
			});
	}

	injectHTML(htmlContent: string) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlContent, 'text/html');

		const styleTags = doc.querySelectorAll('style');
		styleTags.forEach(style => {
			this.appendStylesToHead(style.innerHTML);
		});

		const container = this.contentContainer.nativeElement;
		const contentWithoutStyles = doc.body.innerHTML;
		this.renderer.setProperty(container, 'innerHTML', contentWithoutStyles);
	}

	appendStylesToHead(cssContent: string) {
		const styleElement = this.renderer.createElement('style');
		this.renderer.appendChild(styleElement, this.renderer.createText(cssContent));

		this.renderer.appendChild(document.head, styleElement);
	}
}
