/*
 * Copyright 2019-2025 Bloomreach
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

import render from 'dom-serializer';
import type { Document } from 'domhandler';
import { getAttributeValue, getElementsByTagName, hasAttrib } from 'domutils';
import { parseDocument } from 'htmlparser2';
import { inject, injectable } from 'inversify';
import { Link, TYPE_LINK_RESOURCE } from './link';
import { LinkFactory } from './link-factory';

export const LinkRewriterService = Symbol.for('LinkRewriterService');

export interface LinkRewriter {
  /**
   * Rewrite links to pages and resources in the HTML content.
   * @param content The HTML content to rewrite links.
   * @param type The content type.
   */
  rewrite(content: string, type?: string): string;
}

@injectable()
export class LinkRewriterImpl implements LinkRewriter {
  constructor(@inject(LinkFactory) private linkFactory: LinkFactory) {}

  rewrite(content: string, type = 'text/html'): string {
    const document = parseDocument(content, { xmlMode: type !== 'text/html' });

    this.rewriteAnchors(document);
    this.rewriteImages(document);

    return render(document, { selfClosingTags: true });
  }

  private rewriteAnchors(document: Document): void {
    Array.from(getElementsByTagName('a', document))
      .filter((element) => hasAttrib(element, 'href') && hasAttrib(element, 'data-type'))
      .forEach((element) => {
        const url = this.linkFactory.create({
          href: getAttributeValue(element, 'href'),
          type: getAttributeValue(element, 'data-type'),
        } as Link);

        if (url) {
          element.attribs.href = url;
        }

        return element;
      });
  }

  private rewriteImages(document: Document): void {
    Array.from(getElementsByTagName('img', document))
      .filter((element) => hasAttrib(element, 'src'))
      .forEach((element) => {
        const url = this.linkFactory.create({
          href: getAttributeValue(element, 'src'),
          type: TYPE_LINK_RESOURCE,
        });

        if (url) {
          element.attribs.src = url;
        }
      });
  }
}
