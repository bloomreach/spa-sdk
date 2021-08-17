import { default as cookie } from 'cookie';

export class Cookie {
  /**
   * Set cookie in the document
   * @param name Cookie name
   * @param value Cookie value
   * @param ttl  Sets the cookie max-age in seconds
   */
  public static SET_COOKIE(name: string, value: string, ttl: number): void {
    if (document && name && value) {
      const maxAge = ttl > 28 ? 2419200 : ttl * 24 * 60 * 60;
      document.cookie = cookie.serialize(name, value, { maxAge });
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
