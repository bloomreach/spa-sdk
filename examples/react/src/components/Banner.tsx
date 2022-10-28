/*
 * Copyright 2019-2022 Bloomreach
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

import { BrManageContentButton, BrProps } from '@bloomreach/react-sdk';
import { Document, ImageSet } from '@bloomreach/spa-sdk';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Banner({ component, page }: BrProps): JSX.Element | null {
  const documentRef = component?.getModels().document;
  const document = !!documentRef && page?.getContent(documentRef);

  const [safeHTML, setSafeHTML] = useState('');

  useEffect(() => {
    async function rewriteLinksAndSanitize(): Promise<void> {
      if (!document || !page) {
        return;
      }

      const { content } = document.getData<DocumentData>();
      const sanitized = await page.sanitize(content.value);
      const html = await page.rewriteLinks(sanitized);
      setSafeHTML(html);
    }

    rewriteLinksAndSanitize();
  });

  if (!document || !page) {
    return null;
  }

  const { image: imageRef, link: linkRef, title } = document.getData<DocumentData>();
  const image = imageRef && page.getContent<ImageSet>(imageRef);
  const link = linkRef && page.getContent<Document>(linkRef);

  return (
    <div className={`jumbotron mb-3 ${page.isPreview() ? 'has-edit-button' : ''}`}>
      <BrManageContentButton
        content={document}
        documentTemplateQuery="new-banner-document"
        folderTemplateQuery="new-banner-folder"
        parameter="document"
        root="banners"
        relative
        pickerSelectableNodeTypes="best:banner,hap:bannerdocument"
      />
      {title && <h1>{title}</h1>}
      {image && <img className="img-fluid" src={image.getOriginal()?.getUrl()} alt={title} />}
      {/* eslint-disable-next-line react/no-danger */}
      {safeHTML && <div dangerouslySetInnerHTML={{ __html: safeHTML }} />}
      {link && (
        <p className="lead">
          <Link to={link.getUrl()!} className="btn btn-primary btn-lg" role="button">
            Learn more
          </Link>
        </p>
      )}
    </div>
  );
}
