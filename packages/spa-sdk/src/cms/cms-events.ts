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

import { Typed } from 'emittery';

/**
 * Channel Manager component update event.
 */
export interface CmsUpdateEvent {
  /**
   * Component's id.
   */
  id: string;

  /**
   * Updated component's properties.
   */
  properties: Record<string, unknown>;
}

/**
 * SPA page rendered event.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PageReadyEvent {}

export interface CmsEvents {
  'cms.update': CmsUpdateEvent;
  'page.ready': PageReadyEvent;
}

export type CmsEventBus = Typed<CmsEvents>;
