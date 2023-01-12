/*
 * Copyright 2020-2022 Bloomreach
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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Component as BrComponent, initialize, Page } from '@bloomreach/spa-sdk';
import { BrSdkModule } from '../br-sdk.module';
import { BrPageComponent } from './br-page.component';

jest.mock('@bloomreach/spa-sdk');

describe('BrPageComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let component: WrapperComponent;
  let componentEl: HTMLElement;

  const someEffect = jest.fn();

  const brComponent: BrComponent = {
    getId: jest.fn(),
    getMeta: jest.fn(),
    getModels: jest.fn(),
    getUrl: jest.fn(),
    getName: jest.fn(),
    getParameters: jest.fn(),
    getProperties: jest.fn(),
    getChildren: jest.fn(),
    getComponent: jest.fn(),
    getComponentById: jest.fn(),
  };
  const page: Page = {
    getButton: jest.fn(),
    getChannelParameters: jest.fn(),
    getComponent: jest.fn(() => brComponent),
    getContent: jest.fn(),
    getDocument: jest.fn(),
    getLocale: jest.fn(),
    getMeta: jest.fn(),
    getTitle: jest.fn(),
    getUrl: jest.fn(),
    getVersion: jest.fn(),
    getVisitor: jest.fn(),
    getVisit: jest.fn(),
    isPreview: jest.fn(),
    rewriteLinks: jest.fn(),
    sync: jest.fn(),
    toJSON: jest.fn(),
    sanitize: jest.fn(),
    prepareHTML: jest.fn(),
  };

  @Component({
    selector: 'br-my-component',
    template: '<div>Hello World</div>',
  })
  class MyComponent implements OnInit {
    ngOnInit(): void {
      someEffect();
    }
  }

  @Component({
    selector: 'br-wrapper-component',
    template: `
      <div>
        <br-page [configuration]="configuration" [mapping]="mapping">
          <ng-template>
            <br-my-component></br-my-component>
          </ng-template>
        </br-page>
      </div>
    `,
  })
  class WrapperComponent {
    configuration: BrPageComponent['configuration'] = {
      NBRMode: false,
    };

    mapping = {};
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyComponent, WrapperComponent],
      imports: [HttpClientTestingModule, BrSdkModule],
      schemas: [NO_ERRORS_SCHEMA],
    });

    jest.mocked(initialize).mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve(page);
        }, 1000);
      }),
    );

    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    componentEl = fixture.nativeElement;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('template render', () => {
    it('should not render children if there is no page and NBR mode is false', fakeAsync(() => {
      fixture.detectChanges();
      expect(someEffect).not.toHaveBeenCalled();
      expect(componentEl).toMatchSnapshot();
      flush();
    }));

    it('should render children if there is no page and NBR mode is true', fakeAsync(() => {
      component.configuration = {
        NBRMode: true,
      };

      fixture.detectChanges();
      expect(someEffect).toHaveBeenCalled();
      expect(componentEl).toMatchSnapshot();
      flush();
    }));

    it('should render children if NBR mode is false and the PageModel becomes available', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(someEffect).toHaveBeenCalled();
    }));

    it('should initialize children only once if NBR mode is true and the PageModel becomes available', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(someEffect).toHaveBeenCalledTimes(1);
    }));
  });
});
