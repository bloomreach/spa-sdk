/*
 * Copyright 2019-2026 Bloomreach
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

import { Logger } from '../logger';
import { CmsEventBus, CmsUpdateEvent } from './cms-events';
import { PostMessageOptions } from './post-message';
import { Procedures, RpcChannel } from './rpc';

const GLOBAL_WINDOW = typeof window === 'undefined' ? undefined : window;

interface CmsProcedures extends Procedures {
  sync(): void;
}

interface CmsEvents {
  update: CmsUpdateEvent;
}

type SpaProcedures = Procedures;

interface SpaEvents {
  ready: never;
}

export class Cms {
  private window?: Window;

  /**
   * @param channel Bidirectional RPC channel to the CMS (always a PostMessage instance).
   * @param cmsEventBus Event bus for relaying CMS updates to the SPA (preview mode only).
   * @param logger Optional logger for debug output.
   */
  constructor(
    protected channel: RpcChannel<CmsProcedures, CmsEvents, SpaProcedures, SpaEvents>,
    protected cmsEventBus?: CmsEventBus,
    private logger?: Logger,
  ) {
    this.onStateChange = this.onStateChange.bind(this);
    this.cmsEventBus?.on('page.ready', this.onPageReady.bind(this));
    this.channel.on('update', this.onUpdate.bind(this));
    this.channel.register('inject', this.inject.bind(this));
  }

  initialize({ window = GLOBAL_WINDOW }: PostMessageOptions): void {
    if (this.window === window) {
      return;
    }

    this.window = window;

    if (this.window?.document?.readyState !== 'loading') {
      this.onInitialize();

      return;
    }

    this.window?.document?.addEventListener('readystatechange', this.onStateChange);
  }

  private onInitialize(): void {
    this.logger?.debug('The page is ready to accept incoming messages.');

    this.channel.trigger('ready', undefined as never);
  }

  private onStateChange(): void {
    if (this.window!.document!.readyState === 'loading') {
      return;
    }

    this.onInitialize();
    this.window!.document!.removeEventListener('readystatechange', this.onStateChange);
  }

  protected onPageReady(): void {
    this.logger?.debug('Synchronizing the page.');

    this.channel.call('sync');
  }

  protected onUpdate(event: CmsUpdateEvent): void {
    this.logger?.debug('Received update event.');
    this.logger?.debug('Event:', event);

    this.cmsEventBus?.emit('cms.update', event);
  }

  protected inject(resource: string): Promise<void> {
    if (!this.window?.document) {
      return Promise.reject(new Error('SPA document is not ready.'));
    }

    this.logger?.debug('Received request to inject a resource.');
    this.logger?.debug('Resource:', resource);

    return new Promise<void>((resolve, reject) => {
      const script = this.window!.document.createElement('script');

      script.type = 'text/javascript';
      script.src = resource;
      script.addEventListener('load', () => resolve());
      script.addEventListener('error', () => reject(new Error(`Failed to load resource '${resource}'.`)));
      this.window!.document.body.appendChild(script);
    });
  }
}
