/*
 * Copyright 2020-2026 Bloomreach
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
import { Cms } from './cms';
import { CmsEventBus, CmsEvents } from './cms-events';
import { RpcChannel } from './rpc';

describe('Cms', () => {
  let cms: Cms;
  let eventBus: CmsEventBus;
  let channel: jest.Mocked<RpcChannel<any, any, any, any>>;

  beforeEach(() => {
    eventBus = new Typed<CmsEvents>();
    channel = {
      call: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      register: jest.fn(),
      trigger: jest.fn(),
    };

    cms = new Cms(channel, eventBus);
  });

  describe('initialize', () => {
    const getReadyState = jest.fn();

    beforeEach(() => {
      Object.defineProperty(document, 'readyState', {
        get: getReadyState,
      });
    });

    it('should trigger ready event right away', () => {
      getReadyState.mockReturnValueOnce('interactive');
      cms.initialize({ window });

      expect(channel.trigger).toHaveBeenCalledWith('ready', undefined);
    });

    it('should trigger ready event only once per window', () => {
      getReadyState.mockReturnValueOnce('interactive');
      cms.initialize({ window });
      cms.initialize({ window });

      expect(channel.trigger).toHaveBeenCalledTimes(1);
    });

    it('should not trigger ready event on state change if the state is still loading', async () => {
      getReadyState.mockReturnValueOnce('loading');
      getReadyState.mockReturnValueOnce('loading');
      cms.initialize({ window });

      document.dispatchEvent(new ProgressEvent('readystatechange'));
      await new Promise((resolve) => { setTimeout(resolve, 0); });

      expect(channel.trigger).not.toHaveBeenCalled();
    });

    it('should trigger ready event on state change', async () => {
      getReadyState.mockReturnValueOnce('loading');
      getReadyState.mockReturnValueOnce('interactive');
      cms.initialize({ window });

      document.dispatchEvent(new ProgressEvent('readystatechange'));
      await new Promise((resolve) => { setTimeout(resolve, 0); });

      expect(channel.trigger).toHaveBeenCalledWith('ready', undefined);
    });

    it('should register inject procedure', async () => {
      cms.initialize({ window });

      expect(channel.register).toHaveBeenCalledWith('inject', expect.any(Function));
    });
  });

  describe('onPageReady', () => {
    let callback: FrameRequestCallback;
    let windowLike: Window;

    beforeEach(() => {
      windowLike = Object.create(window) as Window;
      windowLike.requestAnimationFrame = jest.fn((next) => {
        callback = next;
        return 1;
      });
      windowLike.cancelAnimationFrame = jest.fn();
      cms.initialize({ window: windowLike });
    });

    it('synchronizes on the next animation frame', async () => {
      await eventBus.emit('page.ready', {});

      expect(channel.call).not.toHaveBeenCalled();
      callback(0);
      expect(channel.call).toHaveBeenCalledWith('sync');
    });

    it('coalesces requests in one animation frame', async () => {
      await eventBus.emit('page.ready', {});
      await eventBus.emit('page.ready', {});

      expect(windowLike.requestAnimationFrame).toHaveBeenCalledTimes(1);
      callback(0);
      expect(channel.call).toHaveBeenCalledTimes(1);
    });

    it('schedules another sync after a completed frame', async () => {
      await eventBus.emit('page.ready', {});
      callback(0);
      await eventBus.emit('page.ready', {});

      expect(windowLike.requestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it('cancels a pending sync when the window changes', async () => {
      await eventBus.emit('page.ready', {});
      cms.initialize({ window: Object.create(window) as Window });

      expect(windowLike.cancelAnimationFrame).toHaveBeenCalledWith(1);
    });

    it('does not schedule before browser initialization', async () => {
      const uninitialized = new Cms(channel, eventBus);
      await eventBus.emit('page.ready', {});

      expect(channel.call).not.toHaveBeenCalled();
      expect(uninitialized).toBeDefined();
    });
  });

  describe('onUpdate', () => {
    it('should process postponed events on initialization', async () => {
      cms.initialize({ window });

      expect(channel.on).toHaveBeenCalledWith('update', expect.any(Function));

      const [, onUpdate] = channel.on.mock.calls.pop()!;
      const event = { id: 'id', properties: { a: 'b' } };
      const emitSpy = jest.spyOn(eventBus, 'emit');
      onUpdate(event);

      expect(emitSpy).toHaveBeenCalledWith('cms.update', event);
    });
  });

  describe('inject', () => {
    let inject: (string: any) => Promise<void>;
    let testDocument: Document | undefined;
    let windowLike: Window & typeof globalThis;

    beforeEach(() => {
      testDocument = document;
      windowLike = Object.create(window) as Window & typeof globalThis;
      Object.defineProperty(windowLike, 'document', { get: () => testDocument, configurable: true });
      [[, inject]] = channel.register.mock.calls;
      cms.initialize({ window: windowLike });
    });

    it('should not proceed if there is no window', async () => {
      testDocument = undefined;

      await expect(inject('something')).rejects.toThrow('SPA document is not ready.');
    });

    it('should put a script element', async () => {
      inject('url1');

      await new Promise(process.nextTick);

      const script = document.querySelector('script[src="url1"]');

      expect(script).not.toBeNull();
      expect(script).toMatchSnapshot();
    });

    it('should resolve a promise on load event', async () => {
      const promise = inject('url2');

      await new Promise(process.nextTick);
      const element = document.querySelector('script[src="url2"]');
      element?.dispatchEvent(new Event('load'));

      await expect(promise).resolves.toBeUndefined();
    });

    it('should reject a promise on error event', async () => {
      const promise = inject('url3');

      await new Promise(process.nextTick);
      const element = document.querySelector('script[src="url3"]');
      element?.dispatchEvent(new Event('error'));

      await expect(promise).rejects.toThrow("Failed to load resource 'url3'.");
    });
  });
});
