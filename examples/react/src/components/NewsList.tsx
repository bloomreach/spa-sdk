/*
 * Copyright 2019-2023 Bloomreach
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

import React from 'react';
import { Link } from 'react-router-dom';
import { Document } from '@bloomreach/spa-sdk';
import { BrManageContentButton, BrPageContext, BrProps } from '@bloomreach/react-sdk';

interface NewsListItemProps {
  item: Document;
}

export function NewsListItem({ item }: NewsListItemProps): JSX.Element {
  const { author, date, introduction, title } = item.getData<DocumentData>();

  return (
    <div className="card mb-3">
      <BrManageContentButton content={item} />
      <div className="card-body">
        {title && (
          <h2 className="card-title">
            <Link to={item.getUrl()}>{title}</Link>
          </h2>
        )}
        {author && <div className="card-subtitle mb-3 text-muted">{author}</div>}
        {date && <div className="card-subtitle mb-3 small text-muted">{new Date(date).toDateString()}</div>}
        {introduction && <p className="card-text">{introduction}</p>}
      </div>
    </div>
  );
}

type NewsListPaginationProps = Pick<
  Pageable,
  'showPagination' | 'previous' | 'previousPage' | 'pageNumbersArray' | 'currentPage' | 'next' | 'nextPage'
>;

export function NewsListPagination({
  showPagination,
  previous,
  previousPage,
  pageNumbersArray,
  currentPage,
  next,
  nextPage,
}: NewsListPaginationProps): JSX.Element | null {
  const page = React.useContext(BrPageContext);

  if (!page || !showPagination) {
    return null;
  }

  return (
    <nav aria-label="News List Pagination">
      <ul className="pagination">
        <li className={`page-item ${previous ? '' : 'disabled'}`}>
          <Link to={previous ? page.getUrl(`?page=${previousPage}`) : '#'} className="page-link" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
            <span className="sr-only">Previous</span>
          </Link>
        </li>
        {pageNumbersArray.map((pageNumber, key) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={key} className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}>
            <Link to={page.getUrl(`?page=${pageNumber}`)} className="page-link">
              {pageNumber}
            </Link>
          </li>
        ))}
        <li className={`page-item ${next ? '' : 'disabled'}`}>
          <Link to={next ? page.getUrl(`?page=${nextPage}`) : '#'} className="page-link" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
            <span className="sr-only">Next</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export function NewsList({ component, page }: BrProps): JSX.Element | null {
  const pageable = component?.getModels<PageableModels>().pageable;

  if (!pageable || !page) {
    return null;
  }

  return (
    <div>
      {pageable.items.map((reference, key) => (
        // eslint-disable-next-line react/no-array-index-key
        <NewsListItem key={key} item={page.getContent<Document>(reference)} />
      ))}
      {page.isPreview() && (
        <div className="has-edit-button float-right">
          <BrManageContentButton
            documentTemplateQuery="new-news-document"
            folderTemplateQuery="new-news-folder"
            root="news"
          />
        </div>
      )}
      <NewsListPagination
        showPagination={pageable.showPagination}
        previousPage={pageable.previousPage}
        pageNumbersArray={pageable.pageNumbersArray}
        currentPage={pageable.currentPage}
        nextPage={pageable.nextPage}
        next={pageable.next}
        previous={pageable.previous}
      />
    </div>
  );
}
