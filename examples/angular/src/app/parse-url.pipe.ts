/*
 * Copyright 2020-2023 Bloomreach
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

import { Pipe, PipeTransform } from '@angular/core';
import { Params } from '@angular/router';

declare global {
  interface URLSearchParams {
    entries(): IterableIterator<[string, string]>;
  }
}

@Pipe({ name: 'parseUrl' })
export class ParseUrlPipe implements PipeTransform {
  transform(url: string): URL & { queryParams: Params } {
    const value = new URL(url, 'https://example.com');
    return { ...value, ...{ queryParams: Object.fromEntries([...value.searchParams.entries()]) } };
  }
}
