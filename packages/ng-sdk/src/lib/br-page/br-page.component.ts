/*
 * Copyright 2020-2023 Bloomreach
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

import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  AfterContentChecked,
  AfterContentInit,
  Component,
  ContentChild,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  TemplateRef,
  Type,
  ViewChild,
} from '@angular/core';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { Configuration, destroy, initialize, isPage, Page, PageModel } from '@bloomreach/spa-sdk';
import { from, of, Subject } from 'rxjs';
import { filter, map, mapTo, pairwise, pluck, switchMap, take } from 'rxjs/operators';
import type { BrComponentContext } from '../br-component.directive';
import { BrProps } from '../br-props.model';
import { BrNodeContext, BrPageService } from './br-page.service';

/**
 * The brXM page.
 */
@Component({
  selector: 'br-page',
  templateUrl: './br-page.component.html',
  providers: [BrPageService],
})
export class BrPageComponent implements AfterContentChecked, AfterContentInit, OnChanges, OnDestroy {
  /**
   * The configuration of the SPA SDK.
   * @see https://www.npmjs.com/package/@bloomreach/spa-sdk#configuration
   */
  @Input() configuration!: Omit<Configuration, 'httpClient'>;

  /**
   * The brXM and Angular components mapping.
   */
  @Input() mapping: Record<keyof any, Type<BrProps>> = {};

  /**
   * The pre-initialized page instance or prefetched page model.
   * Mostly this property should be used to transfer state from the server-side to the client-side.
   */
  @Input() page?: Page | PageModel;

  /**
   * The TransferState key is used to transfer the state from the server-side to the client-side.
   * By default, it equals to `brPage`.
   * If `false` is passed then the state transferring feature will be disabled.
   */
  @Input() stateKey: StateKey<PageModel | undefined> | false = makeStateKey('brPage');

  /**
   * The current state of the page component.
   */
  @Output() state = this.pageService.state;

  /**
   * Http error handling
   */
  @Output() httpError = new EventEmitter<HttpErrorResponse>();

  @ViewChild('brNode', { static: true }) node!: TemplateRef<BrNodeContext>;

  @ContentChild(TemplateRef, { static: true }) private template?: TemplateRef<BrComponentContext>;

  private afterContentChecked$ = new Subject();

  constructor(
    private httpClient: HttpClient,
    private pageService: BrPageService,
    zone: NgZone,
    @Inject(PLATFORM_ID) private platform: any,
    @Optional() private transferState?: TransferState,
  ) {
    this.request = this.request.bind(this);

    this.state.pipe(pairwise(), pluck(0), filter(isPage)).subscribe(destroy);

    this.state
      .pipe(
        filter(isPage),
        switchMap((page) => this.afterContentChecked$.pipe(take(1), mapTo(page))),
      )
      .subscribe((page) => zone.runOutsideAngular(() => page.sync()));

    this.state
      .pipe(
        filter(() => isPlatformServer(this.platform)),
        filter(isPage),
      )
      .subscribe((page) => this.stateKey && this.transferState?.set(this.stateKey, page.toJSON()));
  }

  get context(): BrNodeContext {
    const page = this.state.getValue();
    const component = page?.getComponent();
    const pageOrNBR = page || this.configuration?.NBRMode;

    return {
      component,
      page,
      $implicit: component,
      template: pageOrNBR ? this.template : undefined,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.configuration || changes.page) {
      this.initialize(changes.page?.currentValue);
    }

    if (changes.mapping?.currentValue !== this.pageService.mapping) {
      this.pageService.mapping = this.mapping;
    }

    if (changes.stateKey?.previousValue && isPlatformServer(this.platform)) {
      if (changes.stateKey.currentValue && this.transferState?.hasKey(changes.stateKey.previousValue)) {
        this.transferState?.set(
          changes.stateKey.currentValue,
          this.transferState?.get(changes.stateKey.previousValue, undefined),
        );
      }

      this.transferState?.remove(changes.stateKey.previousValue);
    }
  }

  ngAfterContentChecked(): void {
    this.afterContentChecked$.next();
  }

  ngAfterContentInit(): void {
    this.pageService.node = this.node;
  }

  ngOnDestroy(): void {
    this.state.next(undefined);
    this.state.complete();
    this.afterContentChecked$.complete();
  }

  private initialize(page: Page | PageModel | undefined): void {
    if (this.stateKey && isPlatformBrowser(this.platform) && this.transferState?.hasKey(this.stateKey)) {
      page = page ?? this.transferState?.get(this.stateKey, undefined);
      this.transferState?.remove(this.stateKey);
    }

    const configuration = { httpClient: this.request, ...this.configuration } as Configuration;
    const observable = page ? of(initialize(configuration, page)) : from(initialize(configuration));

    observable.pipe(take(1)).subscribe((state) => {
      this.state.next(state);
    });
  }

  private request(...[{ data: body, headers, method, url }]: Parameters<Configuration['httpClient']>): Promise<void | {
    data: PageModel;
  }> {
    return this.httpClient
      .request<PageModel>(method, url, {
        body,
        headers: headers as Record<string, string | string[]>,
        responseType: 'json',
      })
      .pipe(map((data) => ({ data })))
      .toPromise()
      .catch((error) => this.httpError.emit(error));
  }
}
