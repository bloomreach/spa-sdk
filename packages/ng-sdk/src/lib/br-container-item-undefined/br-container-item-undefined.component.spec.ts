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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContainerItem } from '@bloomreach/spa-sdk';
import { BrContainerItemUndefinedComponent } from './br-container-item-undefined.component';

describe('BrContainerItemUndefinedComponent', () => {
  let component: BrContainerItemUndefinedComponent;
  let fixture: ComponentFixture<BrContainerItemUndefinedComponent>;
  let containerItem: ContainerItem;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({ declarations: [BrContainerItemUndefinedComponent] }).compileComponents();
    }),
  );

  beforeEach(() => {
    containerItem = {
      getType: () => 'Some Type',
    } as unknown as typeof containerItem;

    fixture = TestBed.createComponent(BrContainerItemUndefinedComponent);
    component = fixture.componentInstance;
    component.component = containerItem;
    fixture.detectChanges();
  });

  it('should render a message', () => {
    expect(fixture.nativeElement).toMatchSnapshot();
  });
});
