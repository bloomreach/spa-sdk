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
import { ConsoleLogger, ConsoleToken } from './console';
import { Logger } from './logger';

export function LoggerModule(): ContainerModule {
  return new ContainerModule((bind) => {
    bind(ConsoleToken).toConstantValue(console);
    bind(ConsoleLogger).toSelf().inSingletonScope();
    bind(Logger).toService(ConsoleLogger);
  });
}

export { Level } from './level';
export { Logger } from './logger';
