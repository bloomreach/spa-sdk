/*
 * Copyright 2020-2025 Bloomreach
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

import { Component, Input, NgModule } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  Container,
  TYPE_CONTAINER_BOX,
  TYPE_CONTAINER_INLINE,
  TYPE_CONTAINER_NO_MARKUP,
  TYPE_CONTAINER_ORDERED_LIST,
  TYPE_CONTAINER_UNORDERED_LIST,
} from '@bloomreach/spa-sdk';
import { BehaviorSubject } from 'rxjs';
import { BrContainerBoxComponent } from './br-container-box/br-container-box.component';
import { BrContainerInlineComponent } from './br-container-inline/br-container-inline.component';
import { BrContainerOrderedListComponent } from './br-container-ordered-list/br-container-ordered-list.component';
import { BrContainerUnorderedListComponent } from './br-container-unordered-list/br-container-unordered-list.component';
import { BrNodeContainerDirective } from './br-node-container.directive';
import { BrNodeDirective } from './br-node.directive';
import { BrPageService } from './br-page/br-page.service';

Component({ selector: 'br-container-box', template: '', standalone: false })(
  BrContainerBoxComponent,
);
Component({ selector: 'br-container-inline', template: '', standalone: false })(
  BrContainerInlineComponent,
);
Component({
  selector: 'br-container-ordered-list',
  template: '',
  standalone: false,
})(BrContainerOrderedListComponent);
Component({
  selector: 'br-container-unordered-list',
  template: '',
  standalone: false,
})(BrContainerUnorderedListComponent);

@Component({
  selector: 'br-container-test',
  template: '<a></a>',
  standalone: false,
})
class ContainerTestComponent {}

@NgModule({
  declarations: [
    BrContainerBoxComponent,
    BrContainerInlineComponent,
    BrContainerOrderedListComponent,
    BrContainerUnorderedListComponent,
    ContainerTestComponent,
  ],
})
class TestModule {}

@Component({
  template: '<ng-container [brNodeContainer]="container"></ng-container>',
  standalone: false,
})
class TestComponent {
  @Input() container!: Container;
}

describe('BrNodeContainerDirective', () => {
  let container: jest.Mocked<Container>;
  let node: BrNodeDirective;
  let page: BrPageService;
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    container = {
      getChildren: jest.fn(() => []),
      getType: jest.fn(() => TYPE_CONTAINER_BOX),
      getMeta: jest.fn(() => ({
        clear: jest.fn(),
        render: jest.fn(),
      })),
    } as unknown as typeof container;
    node = {} as typeof node;
    page = {
      mapping: {},
      state: new BehaviorSubject(undefined),
    } as typeof page;
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, BrNodeDirective, BrNodeContainerDirective],
      imports: [TestModule],
      providers: [
        { provide: BrNodeDirective, useFactory: () => node },
        { provide: BrPageService, useFactory: () => page },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    component.container = container;
  });

  describe('getMapping', () => {
    it('should render a mapped container', () => {
      page.mapping[TYPE_CONTAINER_BOX] = ContainerTestComponent;
      fixture.detectChanges();

      expect(fixture.nativeElement).toMatchSnapshot();
    });

    it('should render box container by default', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement).toMatchSnapshot();
    });

    it('should render an inline container', () => {
      container.getType.mockReturnValue(TYPE_CONTAINER_INLINE);
      fixture.detectChanges();

      expect(fixture.nativeElement).toMatchSnapshot();
    });

    it('should render an ordered list container', () => {
      container.getType.mockReturnValue(TYPE_CONTAINER_ORDERED_LIST);
      fixture.detectChanges();

      expect(fixture.nativeElement).toMatchSnapshot();
    });

    it('should render an unordered list container', () => {
      container.getType.mockReturnValue(TYPE_CONTAINER_UNORDERED_LIST);
      fixture.detectChanges();

      expect(fixture.nativeElement).toMatchSnapshot();
    });

    it('should render a no markup container', () => {
      container.getType.mockReturnValue(TYPE_CONTAINER_NO_MARKUP);
      fixture.detectChanges();

      expect(fixture.nativeElement).toMatchSnapshot();
      expect(container.getChildren).toBeCalled();
    });
  });
});
