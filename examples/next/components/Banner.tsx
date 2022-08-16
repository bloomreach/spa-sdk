/*
 * Copyright 2019-2021 Bloomreach
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
import Link from 'next/link';
import { Document, ImageSet } from '@bloomreach/spa-sdk';
import { BrManageContentButton, BrProps } from '@bloomreach/react-sdk';

export function Banner(props: BrProps): JSX.Element | null {
  const documentRef = props.component?.getModels().document;
  const document = !!documentRef && props.page?.getContent(documentRef);

  if (!document) {
    return null;
  }

  const { content, image: imageRef, link: linkRef, title } = document.getData<DocumentData>();
  const image = imageRef && props.page?.getContent<ImageSet>(imageRef);
  const link = linkRef && props.page?.getContent<Document>(linkRef);

  return (
    <div className={`jumbotron mb-3 ${props.page?.isPreview() ? 'has-edit-button' : ''}`}>
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image && <img className="img-fluid" src={image.getOriginal()?.getUrl()} alt={title} />}
      {content && props.page && (
        <div dangerouslySetInnerHTML={{ __html: props.page.rewriteLinks(props.page.sanitize(content.value)) }} />
      )}
      {link && (
        <p className="lead">
          <Link href={link.getUrl() ?? '/'}>
            <a className="btn btn-primary btn-lg" role="button">
              Learn more
            </a>
          </Link>
        </p>
      )}
    </div>
  );
}
