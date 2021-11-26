/*
 * Copyright 2021 Bloomreach
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

import { Cookie } from './cookie';
import { HttpRequest } from '../spa/http';

describe('Cookie', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  it('should set and parse cookie on document without ttl', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 0);
    expect(document.cookie).toEqual('testName=testValue; Max-Age=0');
  });

  it('should set and parse cookie on document with ttl', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 7);
    expect(document.cookie).toEqual('testName=testValue; Max-Age=604800');
  });

  it('should not set cookie with empty strings args', () => {
    Cookie.SET_COOKIE('', '', 0);
    expect(document.cookie).toEqual('');
  });

  it('should set empty string with empty strings args', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 14);
    expect(Cookie.GET_COOKIE()).toEqual({ testName: 'testValue', 'Max-Age': '1209600' });
  });

  it('should remove cookie from document', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 0);
    Cookie.ERASE_COOKIE('testName');
    expect(document.cookie).toEqual('testName=; Max-Age=0');
  });

  it('should not set more than 28 days for ttl', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 29);
    expect(document.cookie).toEqual('testName=testValue; Max-Age=2419200');
  });

  it('should return empty object if Window is not available', () => {
    jest.spyOn(Cookie, 'isWindowAvailable' as never).mockImplementation(() => false as never);

    expect(Cookie.GET_COOKIE()).toEqual({});
  });

  it('should get cookies from request object', () => {
    const request: HttpRequest = {
      headers: { cookie: 'foo=bar' },
    };

    expect(Cookie.GET_COOKIE_FROM_REQUEST(request)).toEqual({ foo: 'bar' });
  });

  it('should return empty object if cookie is missing in the request', () => {
    const request: HttpRequest = {
      headers: {},
    };

    expect(Cookie.GET_COOKIE_FROM_REQUEST(request)).toEqual({});
  });
});
