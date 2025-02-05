/*
 * Copyright 2024-2025 Bloomreach
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

import { Pipe, PipeTransform } from '@angular/core';
import { TYPE_LINK_INTERNAL, isLink } from '@bloomreach/spa-sdk';

@Pipe({
  standalone: true,
  name: 'isInternalLink',
})
export class IsInternalLinkPipe implements PipeTransform {
  transform(value: unknown): boolean {
    return isLink(value) && value.type === TYPE_LINK_INTERNAL;
  }
}
