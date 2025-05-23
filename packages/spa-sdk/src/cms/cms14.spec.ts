/*
 * Copyright 2019-2025 Bloomreach
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

import { Typed } from 'emittery';
import { CmsEventBus, CmsEvents } from './cms-events';
import { Cms14Impl } from './cms14';

describe('Cms', () => {
  let cms: Cms14Impl;
  let eventBus: CmsEventBus;
  let window: Window;

  beforeEach(() => {
    eventBus = new Typed<CmsEvents>();
    window = {} as Window;

    cms = new Cms14Impl(eventBus);
  });

  describe('initialize', () => {
    it('should not fail if there is no window object', () => {
      expect(() => cms.initialize({})).not.toThrow();
    });

    it('should not initialize an SPA object if there is already one', () => {
      const spa: any = {};
      const windowWithSpa = { SPA: spa } as Window;
      cms.initialize({ window: windowWithSpa });

      expect(windowWithSpa.SPA).toBe(spa);
    });

    it('should initialize an SPA object', () => {
      cms.initialize({ window });

      expect(window.SPA).toBeDefined();
      expect(window.SPA).toHaveProperty('init');
      expect(window.SPA).toHaveProperty('renderComponent');
    });
  });

  describe('onInit', () => {
    it('should process postponed events on initialization', async () => {
      const sync = jest.fn();
      cms.initialize({ window });
      await eventBus.emit('page.ready', {});

      expect.assertions(2);
      expect(sync).not.toHaveBeenCalled();
      window.SPA!.init({ sync });
      expect(sync).toHaveBeenCalled();
    });
  });

  describe('onRenderComponent', () => {
    it('should emit cms.update on render component call', () => {
      cms.initialize({ window });
      jest.spyOn(eventBus, 'emit');
      window.SPA!.renderComponent('some-id', { property: 'value' });

      expect(eventBus.emit).toHaveBeenCalledWith('cms.update', {
        id: 'some-id',
        properties: { property: 'value' },
      });
    });
  });

  describe('sync', () => {
    it('should call sync on page.ready event', async () => {
      const sync = jest.fn();
      cms.initialize({ window });
      window.SPA!.init({ sync });
      await eventBus.emit('page.ready', {});

      expect(sync).toHaveBeenCalled();
    });
  });
});
