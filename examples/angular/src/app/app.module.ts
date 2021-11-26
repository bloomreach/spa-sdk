/*
 * Copyright 2020-2021 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrSdkModule } from '@bloomreach/ng-sdk';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent, ENDPOINT } from './index/index.component';
import { IsExternalLinkPipe } from './is-external-link.pipe';
import { IsInternalLinkPipe } from './is-internal-link.pipe';
import { BannerComponent } from './banner/banner.component';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';
import { ContentComponent } from './content/content.component';
import { MenuComponent } from './menu/menu.component';
import { ParseUrlPipe } from './parse-url.pipe';
import { NewsListComponent } from './news-list/news-list.component';
import { NewsItemComponent } from './news-item/news-item.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    IndexComponent,
    BannerComponent,
    CookieConsentComponent,
    ContentComponent,
    IsExternalLinkPipe,
    IsInternalLinkPipe,
    MenuComponent,
    NewsItemComponent,
    NewsListComponent,
    ParseUrlPipe,
  ],
  entryComponents: [BannerComponent, CookieConsentComponent, ContentComponent, MenuComponent, NewsListComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'brxm-angular-spa' }),
    BrowserTransferStateModule,
    BrSdkModule,
    AppRoutingModule,
  ],
  providers: [{ provide: ENDPOINT, useValue: environment.endpoint }],
})
export class AppModule {}
