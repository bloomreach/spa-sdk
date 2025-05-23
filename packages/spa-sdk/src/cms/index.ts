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

import { ContainerModule } from 'inversify';
import { Typed } from 'emittery';
import { CmsImpl, CmsService } from './cms';
import { Cms14Impl } from './cms14';
import { CmsEventBusService } from './cms-events';
import { PostMessageService, PostMessage } from './post-message';
import { RpcClientService, RpcServerService } from './rpc';

export function CmsModule(): ContainerModule {
  return new ContainerModule((bind) => {
    bind(CmsEventBusService)
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

export { CmsOptions, CmsService, Cms } from './cms';
export { CmsUpdateEvent, CmsEventBusService, CmsEventBus } from './cms-events';
export { PostMessageOptions, PostMessageService, PostMessage } from './post-message';
export { RpcClientService, RpcClient, RpcServerService, RpcServer } from './rpc';
