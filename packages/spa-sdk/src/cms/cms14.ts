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

import { injectable, inject, optional } from 'inversify';
import { Spa, SpaService } from '../spa';
import { CmsEventBus } from './cms-events';
import { CmsOptions, Cms } from './cms';
import { Logger } from '../logger';
import { CmsEventBusService } from './index';

const GLOBAL_WINDOW = typeof window === 'undefined' ? undefined : window;

interface CmsApi {
  sync(): void;
}

interface SpaApi {
  init(api: CmsApi): void;
  renderComponent(id: string, properties: Record<string, unknown>): void;
}

declare global {
  interface Window {
    SPA?: SpaApi;
  }
}

@injectable()
export class Cms14Impl implements Cms {
  private api?: CmsApi;

  // eslint-disable-next-line @typescript-eslint/ban-types
  private postponed: Function[] = [];

  constructor(
    @inject(SpaService) private spa: Spa,
    @inject(CmsEventBusService) @optional() protected eventBus?: CmsEventBus,
    @inject(Logger) @optional() private logger?: Logger,
  ) {}

  private async flush(): Promise<void> {
    this.postponed.splice(0).forEach((task) => task());
  }

  private postpone<T extends (...args: any[]) => any>(task: T) {
    return (...args: Parameters<T>) => {
      if (this.api) {
        return task.apply(this, args);
      }

      this.postponed.push(task.bind(this, ...args));

      return undefined;
    };
  }

  initialize({ window = GLOBAL_WINDOW }: CmsOptions): void {
    if (this.api || !window || window.SPA) {
      return;
    }

    this.logger?.debug('Initiating a handshake with the Experience Manager.');
    this.eventBus?.on('page.ready', this.postpone(this.sync));

    window.SPA = {
      init: this.onInit.bind(this),
      renderComponent: this.onRenderComponent.bind(this),
    };
  }

  protected onInit(api: CmsApi): void {
    this.logger?.debug('Completed the handshake with the Experience Manager.');

    this.api = api;
    this.flush();
  }

  protected onRenderComponent(id: string, properties: Record<string, unknown>): void {
    this.logger?.debug('Received component rendering request.');
    this.logger?.debug('Component:', id);
    this.logger?.debug('Properties', properties);

    this.spa.onCmsUpdate({ id, properties });
  }

  protected sync(): void {
    this.logger?.debug('Synchronizing the page.');

    this.api!.sync();
  }
}
