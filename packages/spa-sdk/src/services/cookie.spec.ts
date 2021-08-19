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

  it('should get cookies from request object', () => {
    const req: HttpRequest = {
      headers: { cookie: 'foo=bar' },
    };

    expect(Cookie.GET_COOKIE_FROM_REQUEST(req)).toEqual({ foo: 'bar' });
  });
});
