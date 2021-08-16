import { default as cookie } from 'cookie';

export class Cookie {
  /**
   * Set cookie in the document
   * @param name Cookie name
   * @param value Cookie value
   * @param ttl  Sets the cookie expires time in milliseconds
   */
  public static SET_COOKIE(name: string, value: string, ttl: number): void {
    if (document && name && value) {
      document.cookie = cookie.serialize(name, value, { maxAge: ttl / 1000 });
    }
  }

  /**
   * Retrieve data from cookies
   * @return Cookie object.
   */
  public static GET_COOKIE(): Record<string, string> {
    return cookie.parse(document?.cookie ?? '');
  }

  /**
   * Erase cookie in the document
   * @param name Cookie name
   */
  public static ERASE_COOKIE(name: string): void {
    if (document) {
      document.cookie = cookie.serialize(name, '', { maxAge: 0 });
    }
  }
}
