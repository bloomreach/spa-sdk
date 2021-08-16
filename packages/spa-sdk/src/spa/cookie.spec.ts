import { Cookie } from './cookie';

describe('Cookie', () => {
  beforeEach(() => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  it('should set and parse cookie on document without ttl', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 0);
    expect(document.cookie).toEqual('testName=testValue; Max-Age=0');
  });

  it('should set and parse cookie on document with ttl', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 24000);
    expect(document.cookie).toEqual('testName=testValue; Max-Age=24');
  });

  it('should not set cookie with empty strings args', () => {
    Cookie.SET_COOKIE('', '', 0);
    expect(document.cookie).toEqual('');
  });

  it('should set empty string with empty strings args', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 0);
    expect(Cookie.GET_COOKIE()).toEqual({ testName: 'testValue', 'Max-Age': '0' });
  });

  it('should remove cookie from document', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 24000);
    Cookie.ERASE_COOKIE('testName');
    expect(document.cookie).toEqual('testName=; Max-Age=0');
  });
});
