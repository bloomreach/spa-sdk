/*
 * Copyright 2019 Hippo B.V. (http://www.onehippo.com)
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

import { Typed } from 'emittery';
import { Cms, Window } from './cms';
import { Events } from './events';

describe('Cms', () => {
  let cms: Cms;
  let eventBus: Typed<Events>;
  let window: Window;

  beforeEach(() => {
    eventBus = new Typed<Events>();
    window = {};

    cms = new Cms(eventBus, window);
  });

  describe('initialize', () => {
    it('should not fail if there is no window object', () => {
      const cms = new Cms(eventBus);

      expect(() => cms.initialize()).not.toThrow();
    });

    it('should not initialize an SPA object if there is already one', () => {
      const spa: any = {};
      window.SPA = spa;
      cms.initialize();

      expect(window.SPA).toBe(spa);
    });

    it('should initialize an SPA object', () => {
      cms.initialize();

      expect(window.SPA).toBeDefined();
      expect(window.SPA).toHaveProperty('init');
      expect(window.SPA).toHaveProperty('renderComponent');
    });
  });

  describe('onInit', () => {
    const sync = jest.fn();

    beforeEach(() => {
      sync.mockClear();

      cms.initialize();
      window.SPA!.init({ sync });
    });

    it('should call sync on page.ready event', async () => {
      await eventBus.emit('page.ready', {});

      expect(sync).toHaveBeenCalled();
    });
  });

  describe('onRenderComponent', () => {
    beforeEach(() => cms.initialize());

    it('should emit cms.update on render component call', () => {
      spyOn(eventBus, 'emit');
      window.SPA!.renderComponent('some-id', { property: 'value' });

      expect(eventBus.emit).toHaveBeenCalledWith('cms.update', {
        id: 'some-id',
        properties: { property: 'value' },
      });
    });
  });
});