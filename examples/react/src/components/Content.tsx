/*
 * Copyright 2019-2020 Bloomreach
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

import React from 'react';
import { Document, ImageSet } from '@bloomreach/spa-sdk';
import { BrManageContentButton, BrProps } from '@bloomreach/react-sdk';

export function Content({ component, page }: BrProps): JSX.Element | null {
  const { document: documentRef } = component.getModels<DocumentModels>();
  const document = documentRef && page.getContent<Document>(documentRef);

  if (!document) {
    return null;
  }

  const {
    author,
    content,
    publicationDate,
    date = publicationDate,
    image: imageRef,
    title,
  } = document.getData<DocumentData>();
  const image = imageRef && page.getContent<ImageSet>(imageRef);

  return (
    <div className={page.isPreview() ? 'has-edit-button' : ''}>
      <BrManageContentButton content={document} />
      {image && <img className="img-fluid mb-3" src={image.getOriginal()?.getUrl()} alt={title} />}
      {title && <h1>{title}</h1>}
      {author && <p className="mb-3 text-muted">{author}</p>}
      {date && <p className="mb-3 small text-muted">{new Date(date).toDateString()}</p>}
      {/* eslint-disable-next-line react/no-danger */}
      {content && <div dangerouslySetInnerHTML={{ __html: page.rewriteLinks(page.sanitize(content.value)) }} />}
    </div>
  );
}
