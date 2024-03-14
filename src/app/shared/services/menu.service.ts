import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';

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
  ) {}
}
