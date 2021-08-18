import { default as cookie } from 'cookie';
import { HttpRequest } from './http';

export class Cookie {
  /**
   * Check if window variable is defined
   */
  public static CAN_USE_DOM() {
    return (typeof window !== 'undefined' && window.document);
  }
  /**
   * Set cookie in the document
   * @param name Cookie name
   * @param value Cookie value
   * @param ttl  Sets the cookie expires time in days
   */
  public static SET_COOKIE(name: string, value: string, ttl: number): void {
    if (name && value) {
      const date = new Date();
      date.setTime(date.getTime() + (ttl * 24 * 60 * 60 * 1000));
      document.cookie = cookie.serialize(name, value, { expires: date });
    }
  }

  /**
   * Retrieve data from cookies
   * @return Cookie object.
   */
  public static GET_COOKIE(): Record<string, string> {
    return cookie.parse(document.cookie ?? '');
  }

  /**
   * Retrieve data from request cookies
   * @param request Current user's request.
   * @return Cookie object.
   */
  public static GET_COOKIE_FROM_REQUEST(request: HttpRequest): Record<string, string> {
    return cookie.parse(request.headers?.cookie as string ?? '');
  }

  /**
   * Erase cookie in the document
   * @param name Cookie name
   */
  public static ERASE_COOKIE(name: string): void {
    document.cookie = `${name}=; Max-Age=0`;
  }
}
