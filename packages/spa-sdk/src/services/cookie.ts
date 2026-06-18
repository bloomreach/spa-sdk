/*
 * Copyright 2021-2026 Bloomreach
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

const MAX_TTL_DAYS = 28;

function getSeconds(days: number): number {
  return days * 24 * 60 * 60;
}

export function isWindowDocumentAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Set cookie in the document.
 * @param name Cookie name.
 * @param value Cookie value.
 * @param ttl Sets the cookie max-age in days.
 */
export function setCookie(name: string, value: string, ttl: number): void {
  if (isWindowDocumentAvailable() && name && value) {
    const maxAge = ttl > MAX_TTL_DAYS ? getSeconds(MAX_TTL_DAYS) : getSeconds(ttl);
    document.cookie = cookie.serialize(name, value, { maxAge });
  }
}

/**
 * Retrieve data from document cookies.
 * @return Cookie object.
 */
export function getCookie(): Record<string, string> {
  return isWindowDocumentAvailable() ? cookie.parse(document.cookie ?? '') : {};
}

/**
 * Retrieve data from request cookies.
 * @param request Current user's request.
 * @return Cookie object.
 */
export function getCookieFromRequest(request: HttpRequest): Record<string, string> {
  return cookie.parse((request.headers?.cookie as string) ?? '');
}

/**
 * Erase cookie in the document.
 * @param name Cookie name.
 */
export function eraseCookie(name: string): void {
  if (isWindowDocumentAvailable()) {
    document.cookie = cookie.serialize(name, '', { maxAge: 0 });
  }
}
