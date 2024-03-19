import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';
import { TranslateService } from '@ngx-translate/core';
import { marker as translate } from "@colsen1991/ngx-translate-extract-marker";
import { NGXLogger } from 'ngx-logger';
import { MenuItem } from 'primeng/api';

/**
 * Main menu service for main and user menus
 */
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  // Menus
  mainMenu: any;
  userMenu: any;

	activeItem: MenuItem;

  userSubscription: any;
  languageSubscription: any;

  /**
   * Component constructor
   *
   * @param languageService Language service
   * @param translateService Translate service
   * @param logger Logger service
   */
  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService,
    private logger: NGXLogger
  ) {
		this.mainMenu = [];

      this.mainMenu.push({
        label: this.languageService.translateValue(translate("menu.home.sort")),
        routerLink: "/home",
        command: e => this.activeItem = e.item,
        title: this.languageService.translateValue(translate("menu.home.title"))
      });
      this.mainMenu.push({
        label: this.languageService.translateValue(translate("menu.catalog.sort")),
        routerLink: "/catalog",
        command: e => this.activeItem = e.item,
        title: this.languageService.translateValue(translate("menu.catalog.title"))
      });
	}
}
