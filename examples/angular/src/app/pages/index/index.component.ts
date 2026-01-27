/*
 * Copyright 2024-2026 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CommonModule } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, REQUEST } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BrSdkModule } from '@bloomreach/ng-sdk';
import { extractSearchParams, Page } from '@bloomreach/spa-sdk';
import { Observable, filter } from 'rxjs';
import { ParseUrlPipe } from '../../pipes/parse-url.pipe';
import { MenuComponent } from '../../components/menu/menu.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { ContentComponent } from '../../components/content/content.component';
import { NewsListComponent } from '../../components/news-list/news-list.component';

@Component({
  selector: 'br-index',
  imports: [
    CommonModule,
    BrSdkModule,
    RouterModule,
    ParseUrlPipe,
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit {
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  private request = inject(REQUEST, { optional: true });

  mapping = {
    menu: MenuComponent,
    Banner: BannerComponent,
    Content: ContentComponent,
    'News List': NewsListComponent,
    'Simple Content': ContentComponent,
  };

  configuration = (() => {
    const config: any = {
      path: this.router.url,
      endpoint: import.meta.env?.NG_APP_BRXM_ENDPOINT,
      debug: true,
    };

    if (!config.endpoint && import.meta.env?.NG_APP_BR_MULTI_TENANT_SUPPORT) {
      const endpointQueryParameter = 'endpoint';
      const { searchParams } = extractSearchParams(config.path!, [endpointQueryParameter].filter(Boolean));
      const endpointValue = searchParams.get(endpointQueryParameter);

      // Only set endpoint if the query parameter exists and has a value
      // This prevents SSR loops when the endpoint parameter is missing
      if (endpointValue) {
        return {
          ...config,
          endpoint: endpointValue,
          baseUrl: `?${endpointQueryParameter}=${endpointValue}`,
        };
      }

      throw new Error(
        'Endpoint is missing. Please provide an endpoint via query parameter "?endpoint=..."'
        + 'or configure NG_APP_BRXM_ENDPOINT in the environment variables.',
      );
    }

    if (this.request) {
      config.request = this.request;
    }

    return config;
  })();

  private navigationEnd = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
  ) as Observable<NavigationEnd>;

  ngOnInit(): void {
    this.navigationEnd.subscribe((event) => {
      this.configuration = { ...this.configuration, path: event.url };
    });
  }

  setVisitor(page?: Page): void {
    this.configuration.visitor = page?.getVisitor();
  }
}
