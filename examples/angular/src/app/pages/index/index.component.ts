/*
 * Copyright 2024 Bloomreach
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
import { Component, Inject, OnInit, Optional, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BrPageComponent, BrSdkModule } from '@bloomreach/ng-sdk';
import { Page } from '@bloomreach/spa-sdk';
import { Observable, filter } from 'rxjs';
import { Request } from 'express';
import { REQUEST } from '../../../express.tokens';
import { ParseUrlPipe } from '../../pipes/parse-url.pipe';
import { buildConfiguration } from '../../utils/buildConfiguration';
import { MenuComponent } from '../../components/menu/menu.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { ContentComponent } from '../../components/content/content.component';
import { NewsListComponent } from '../../components/news-list/news-list.component';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'br-index',
  standalone: true,
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
  configuration!: BrPageComponent['configuration'];
  platformId = inject(PLATFORM_ID);

  mapping = {
    menu: MenuComponent,
    Banner: BannerComponent,
    Content: ContentComponent,
    'News List': NewsListComponent,
    'Simple Content': ContentComponent,
  };

  private navigationEnd: Observable<NavigationEnd>;

  constructor(@Optional() @Inject(REQUEST) private request: Request) {
    this.configuration = buildConfiguration(this.router.url, this.request, environment.endpoint);

    this.navigationEnd = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
    ) as Observable<NavigationEnd>;
  }

  ngOnInit(): void {
    this.navigationEnd.subscribe((event) => {
      this.configuration = { ...this.configuration, path: event.url };
    });
  }

  setVisitor(page?: Page): void {
    this.configuration.visitor = page?.getVisitor();
  }
}
