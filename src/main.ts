import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { AppComponent } from './app/app.component';
import { SettingsService } from './app/settings.service';
import { ClicksService } from './app/clicks.service';

if (process.env.ENV === 'production') {
  enableProdMode();
}

bootstrap(AppComponent, [ SettingsService, ClicksService ]).catch(err => console.error(err));