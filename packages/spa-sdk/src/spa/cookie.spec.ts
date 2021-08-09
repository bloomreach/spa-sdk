import { Cookie } from './cookie';

describe('Cookie', () => {
  beforeEach(() => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: '',
    });

    const mockDate = new Date(1466424490000);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);
  });

  it('should set and parse cookie on document without ttl', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 0);
    expect(document.cookie).toEqual('testName=testValue; Expires=Mon, 20 Jun 2016 12:08:10 GMT');
  });
  it('should set and parse cookie on document with ttl', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 2);
    expect(document.cookie).toEqual('testName=testValue; Expires=Wed, 22 Jun 2016 12:08:10 GMT');
  });
  it('shouldnt set cookie with empty strings args', () => {
    Cookie.SET_COOKIE('', '', 0);
    expect(document.cookie).toEqual('');
  });
  it('should set empty string with empty strings args', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 0);
    expect(Cookie.GET_COOKIE()).toEqual({ testName: 'testValue', Expires: 'Wed, 22 Jun 2016 12:08:10 GMT' });
  });
  it('should remove cookie from document', () => {
    Cookie.SET_COOKIE('testName', 'testValue', 0);
    Cookie.ERASE_COOKIE('testName');
    expect(document.cookie).toEqual('testName=; Max-Age=0');
  });
});
