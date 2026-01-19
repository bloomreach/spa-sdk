/*
 * Copyright 2026 Bloomreach
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

// Polyfill TextEncoder/TextDecoder if needed
const { TextDecoder, TextEncoder } = require('util');
if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as any).TextEncoder = TextEncoder;
  (globalThis as any).TextDecoder = TextDecoder;
}

// Load zone.js and zone.js/testing - critical for fakeAsync support
require('zone.js');
require('zone.js/testing');

// Set up Angular testing environment for Angular 21
import { COMPILER_OPTIONS, NgModule, provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

// Only initialize the test environment once per worker
const testBed = getTestBed();
if (testBed.platform == null) {
  // Angular 21+ test environment setup with zone change detection
  class TestModule {}
  NgModule({
    providers: [provideZoneChangeDetection()],
  })(TestModule);

  testBed.initTestEnvironment(
    [BrowserTestingModule, TestModule],
    platformBrowserTesting([
      {
        provide: COMPILER_OPTIONS,
        useValue: {},
        multi: true,
      },
    ]),
  );
}

// Reset TestBed after each test to prevent state pollution
afterEach(() => {
  getTestBed().resetTestingModule();
});
