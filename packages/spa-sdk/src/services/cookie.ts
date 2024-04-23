/*
 * Copyright 2021-2023 Bloomreach
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

import cookie from 'cookie';
import { HttpRequest } from '../spa/http';

export class Cookie {
  static readonly MAX_TTL_DAYS = 28;

  /**
   * Set cookie in the document
   * @param name Cookie name
   * @param value Cookie value
   * @param ttl  Sets the cookie max-age in days
   */
  public static SET_COOKIE(name: string, value: string, ttl: number): void {
    if (this.isWindowDocumentAvailable() && name && value) {
      const maxAge = ttl > this.MAX_TTL_DAYS ? this.getSeconds(this.MAX_TTL_DAYS) : this.getSeconds(ttl);
      document.cookie = cookie.serialize(name, value, { maxAge });
    }
  }

  /**
   * Retrieve data from cookies
   * @return Cookie object.
   */
  public static GET_COOKIE(): Record<string, string> {
    return this.isWindowDocumentAvailable() ? cookie.parse(document.cookie ?? '') : {};
  }

  /**
   * Retrieve data from request cookies
   * @param request Current user's request.
   * @return Cookie object.
   */
  public static GET_COOKIE_FROM_REQUEST(request: HttpRequest): Record<string, string> {
    return cookie.parse((request.headers?.cookie as string) ?? '');
  }

  /**
   * Erase cookie in the document
   * @param name Cookie name
   */
  public static ERASE_COOKIE(name: string): void {
    if (this.isWindowDocumentAvailable()) {
      document.cookie = cookie.serialize(name, '', { maxAge: 0 });
    }
  }

  /**
   * Check if Window Document is available
   */
  private static isWindowDocumentAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
  }

  /**
   * Convert days to seconds
   * @param days Time in days
   * @return number
   */
  private static getSeconds(days: number): number {
    return days * 24 * 60 * 60;
  }
}
