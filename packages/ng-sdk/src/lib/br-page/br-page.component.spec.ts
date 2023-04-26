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

import * as angular from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, getTestBed, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferState } from '@angular/platform-browser';
import { Component, Configuration, destroy, initialize, isPage, Page, PageModel } from '@bloomreach/spa-sdk';

import { BrNodeTypePipe } from '../br-node-type.pipe';
import { BrPageComponent } from './br-page.component';

jest.mock('@bloomreach/spa-sdk');

describe('BrPageComponent', () => {
  let component: BrPageComponent;
  let isPlatformBrowserSpy: jest.SpyInstance;
  let isPlatformServerSpy: jest.SpyInstance;
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<BrPageComponent>;
  let page: jest.Mocked<Page>;
  let transferState: jest.Mocked<TransferState>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BrNodeTypePipe, BrPageComponent],
        imports: [HttpClientTestingModule],
        providers: [{ provide: TransferState, useFactory: () => transferState }],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    httpMock = getTestBed().inject(HttpTestingController);
    isPlatformBrowserSpy = jest.spyOn(angular, 'isPlatformBrowser');
    isPlatformServerSpy = jest.spyOn(angular, 'isPlatformServer');
    transferState = {
      hasKey: jest.fn(),
      get: jest.fn(),
      remove: jest.fn(),
      set: jest.fn(),
    } as unknown as typeof transferState;

    fixture = TestBed.createComponent(BrPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    page = {
      getComponent: jest.fn(),
      sync: jest.fn(),
      toJSON: jest.fn(),
    } as unknown as jest.Mocked<Page>;

    jest.resetAllMocks();

    jest.mocked(isPage).mockImplementation((value) => value === page);
  });

  describe('context', () => {
    it('should contain a root component', () => {
      const root = {} as Component;
      page.getComponent.mockReturnValue(root);
      component.state.next(page);

      expect(component.context?.$implicit).toBe(root);
      expect(component.context?.component).toBe(root);
    });

    it('should contain a page object', () => {
      page.getComponent.mockReturnValue({} as Component);
      component.state.next(page);

      expect(component.context?.page).toBe(page);
    });
  });

  describe('ngAfterContentChecked', () => {
    it('should sync a page', () => {
      component.state.next(page);
      component.ngAfterContentChecked();

      expect(page.sync).toBeCalled();
    });

    it('should not sync a page twice', () => {
      component.state.next(page);
      component.ngAfterContentChecked();
      component.ngAfterContentChecked();

      expect(page.sync).toBeCalledTimes(1);
    });

    it('should not fail if the page is not ready', () => {
      expect(() => component.ngAfterContentChecked()).not.toThrow();
    });
  });

  describe('ngOnChanges', () => {
    it('should destroy a previous page', async () => {
      const previousPage = {} as Page;

      jest.mocked(isPage).mockImplementation(Array.prototype.includes.bind([page, previousPage]));
      component.configuration = {} as Configuration;
      component.page = page;
      component.state.next(previousPage);

      await component.ngOnChanges({
        configuration: new SimpleChange({}, component.configuration, false),
        page: new SimpleChange(previousPage, component.page, false),
      });

      expect(destroy).toBeCalledWith(previousPage);
    });

    it('should initialize a new page when a page input was not changed', async () => {
      jest.mocked(initialize).mockResolvedValueOnce(page);
      component.configuration = {} as Configuration;
      component.page = page;
      await component.ngOnChanges({
        configuration: new SimpleChange({}, component.configuration, false),
      });

      expect(initialize).toBeCalled();
    });

    it('should initialize a page from the configuration', async () => {
      jest.mocked(initialize).mockResolvedValueOnce(page);
      component.configuration = { cmsBaseUrl: 'something' } as Configuration;
      await component.ngOnChanges({
        configuration: new SimpleChange(undefined, component.configuration, true),
      });

      await new Promise(process.nextTick);

      expect(initialize).toBeCalledWith(
        expect.objectContaining({
          cmsBaseUrl: 'something',
          httpClient: expect.any(Function),
        }),
      );
      expect(component.state.getValue()).toBe(page);
    });

    it('should initialize a page from the page model', async () => {
      jest.mocked(initialize as unknown as () => Page).mockReturnValueOnce(page);
      component.configuration = { cmsBaseUrl: 'something' } as Configuration;
      component.page = {} as PageModel;
      await component.ngOnChanges({
        configuration: new SimpleChange(undefined, component.configuration, true),
        page: new SimpleChange(undefined, component.page, true),
      });

      expect(initialize).toBeCalledWith(expect.any(Object), component.page);
      expect(component.state.getValue()).toBe(page);
    });

    it('should initialize a page from the transferred state', async () => {
      const state = {};

      jest.mocked(initialize as unknown as () => Page).mockReturnValueOnce(page);
      jest.mocked(isPlatformBrowserSpy).mockReturnValue(true);
      transferState.hasKey.mockReturnValueOnce(true);
      transferState.get.mockReturnValueOnce(state);

      component.configuration = {} as Configuration;
      await component.ngOnChanges({
        configuration: new SimpleChange(undefined, component.configuration, true),
      });

      expect(transferState.get).toBeCalledWith(component.stateKey, undefined);
      expect(transferState.remove).toBeCalledWith(component.stateKey);
      expect(initialize).toBeCalledWith(expect.any(Object), state);
      expect(component.state.getValue()).toBe(page);
    });

    it('should initialize a page using the page model from the inputs instead of the transferred state', () => {
      jest.mocked(initialize as unknown as () => Page).mockReturnValueOnce(page);
      jest.mocked(isPlatformBrowserSpy).mockReturnValue(true);
      transferState.hasKey.mockReturnValueOnce(true);

      component.configuration = {} as Configuration;
      component.page = {} as PageModel;
      component.ngOnChanges({
        configuration: new SimpleChange(undefined, component.configuration, true),
        page: new SimpleChange(undefined, component.page, true),
      });

      expect(transferState.remove).toBeCalledWith(component.stateKey);
      expect(initialize).toBeCalledWith(expect.any(Object), component.page);
    });

    it('should not initialize from the transferred state if the stateKey is false', async () => {
      jest.mocked(initialize).mockResolvedValueOnce(page);
      jest.mocked(isPlatformBrowserSpy).mockReturnValue(true);

      component.configuration = {} as Configuration;
      component.stateKey = false;
      await component.ngOnChanges({
        configuration: new SimpleChange(undefined, component.configuration, true),
      });

      await new Promise(process.nextTick);

      expect(transferState.hasKey).not.toBeCalled();
      expect(transferState.get).not.toBeCalled();
      expect(transferState.remove).not.toBeCalled();
      expect(initialize).toBeCalledWith(expect.any(Object));
    });

    it('should update a page in the transferred state', async () => {
      const model = {} as PageModel;

      jest.mocked(initialize as unknown as () => Page).mockReturnValueOnce(page);
      jest.mocked(isPlatformServerSpy).mockReturnValue(true);
      page.toJSON.mockReturnValue(model);

      component.configuration = {} as Configuration;
      component.page = page;
      await component.ngOnChanges({
        configuration: new SimpleChange(undefined, component.configuration, true),
        page: new SimpleChange(undefined, component.page, true),
      });

      expect(transferState.set).toBeCalledWith(component.stateKey, model);
    });

    it('should update the transferred state on the stateKey update', () => {
      jest.mocked(isPlatformServerSpy).mockReturnValue(true);
      transferState.hasKey.mockReturnValueOnce(true);
      transferState.get.mockReturnValueOnce('state');

      component.ngOnChanges({
        stateKey: new SimpleChange('old-key', 'new-key', true),
      });

      expect(transferState.set).toBeCalledWith('new-key', 'state');
      expect(transferState.remove).toBeCalledWith('old-key');
    });

    it('should pass a compatible http client', () => {
      jest.mocked(initialize).mockResolvedValueOnce(page);
      component.ngOnChanges({
        configuration: new SimpleChange(undefined, {}, true),
      });

      const [[{ httpClient }]] = jest.mocked(initialize).mock.calls;
      const response = httpClient({
        data: 'something',
        headers: { 'Some-Header': 'value' },
        method: 'POST',
        url: 'https://www.example.com',
      });
      const request = httpMock.expectOne('https://www.example.com');

      expect(request.request.headers.get('Some-Header')).toBe('value');
      expect(request.request.body).toBe('something');
      expect(request.request.method).toBe('POST');
      expect(request.request.url).toBe('https://www.example.com');

      request.flush('something');

      expect(response).resolves.toEqual({ data: 'something' });
    });
  });

  describe('ngOnDestroy', () => {
    it('should destroy a stored page', () => {
      component.state.next(page);
      component.ngOnDestroy();

      expect(destroy).toBeCalledWith(page);
    });

    it('should not destroy a page if it was not initialized', () => {
      component.ngOnDestroy();

      expect(destroy).not.toBeCalled();
    });
  });
});
