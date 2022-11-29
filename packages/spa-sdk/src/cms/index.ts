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

import { AsyncContainerModule } from 'inversify';
import { EventBus } from './events';

export const CmsService = Symbol.for('CmsService');
export const EventBusService = Symbol('EventBusService');
export const EventBusServiceProvider = Symbol('EventBusServiceProvider');
export const PostMessageService = Symbol.for('PostMessageService');
export const RpcClientService = Symbol.for('RpcClientService');
export const RpcServerService = Symbol.for('RpcServerService');

export function CmsModule(): AsyncContainerModule {
  return new AsyncContainerModule(async (bind) => {
    const { Typed } = await import('emittery');
    const { CmsImpl } = await import('./cms');
    const { Cms14Impl } = await import('./cms14');
    const { PostMessage } = await import('./post-message');

    bind(EventBusService)
      .toDynamicValue(() => new Typed())
      .inSingletonScope()
      .when(() => typeof window !== 'undefined');
    bind(PostMessageService).to(PostMessage).inSingletonScope();
    bind(RpcClientService).toService(PostMessageService);
    bind(RpcServerService).toService(PostMessageService);
    bind(CmsService).to(CmsImpl).inSingletonScope().whenTargetIsDefault();
    bind(CmsService).to(Cms14Impl).inSingletonScope().whenTargetNamed('cms14');
  });
}

export type EventBusProvider = () => Promise<EventBus | undefined>;
export { CmsOptions, Cms } from './cms';
export { CmsUpdateEvent, EventBus } from './events';
export { PostMessageOptions, PostMessage } from './post-message';
export { RpcClient, RpcServer } from './rpc';
