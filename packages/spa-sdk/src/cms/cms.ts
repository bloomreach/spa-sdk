/*
 * Copyright 2019-2022 Bloomreach
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

import { inject, injectable, optional } from 'inversify';
import { Logger } from '../logger';
import { CmsEventBus, CmsUpdateEvent } from './cms-events';
import { CmsEventBusService, RpcClientService, RpcServerService } from './index';
import { RpcClient, RpcServer, Procedures } from './rpc';

const GLOBAL_WINDOW = typeof window === 'undefined' ? undefined : window;

export interface CmsOptions {
  /**
   * The window reference for the CMS integration.
   * By default the global window object will be used.
   */
  window?: Window;
}

/**
 * CMS integration layer.
 */
export interface Cms {
  /**
   * Initializes integration with the CMS.
   * @param options The CMS integration options.
   */
  initialize(options: CmsOptions): void;
}

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

@injectable()
export class CmsImpl implements Cms {
  private window?: Window;

  constructor(
    @inject(RpcClientService) protected rpcClient: RpcClient<CmsProcedures, CmsEvents>,
    @inject(RpcServerService) protected rpcServer: RpcServer<SpaProcedures, SpaEvents>,
    @inject(CmsEventBusService) @optional() protected eventBus?: CmsEventBus,
    @inject(Logger) @optional() private logger?: Logger,
  ) {
    this.onStateChange = this.onStateChange.bind(this);
    this.eventBus?.on('page.ready', this.onPageReady.bind(this));
    this.rpcClient.on('update', this.onUpdate.bind(this));
    this.rpcServer.register('inject', this.inject.bind(this));
  }

  initialize({ window = GLOBAL_WINDOW }: CmsOptions): void {
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

    this.rpcServer.trigger('ready', undefined as never);
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

    this.rpcClient.call('sync');
  }

  protected onUpdate(event: CmsUpdateEvent): void {
    this.logger?.debug('Received update event.');
    this.logger?.debug('Event:', event);

    this.eventBus?.emit('cms.update', event);
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
