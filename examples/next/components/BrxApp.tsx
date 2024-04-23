'use client'

/*
 * Copyright 2024 Bloomreach
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

import axios from 'axios';
import {BrComponent, BrPage, BrPageContext} from '@bloomreach/react-sdk';
import Link from 'next/link';
import {Menu} from './Menu';
import {Banner} from './Banner';
import {Content} from './Content';
import {NewsList} from './NewsList';
import {ConfigurationBuilder} from '../utils/buildConfiguration';
import {Page} from '@bloomreach/spa-sdk';
import {useRelevance} from '../hooks/useRelevance';

interface Props {
  configuration: ConfigurationBuilder;
  page?: Page;
}

const BrxApp = ({configuration, page}: Props) => {
  const mapping = { Banner, Content, 'News List': NewsList, 'Simple Content': Content };

  useRelevance(configuration, page);

  return <BrPage configuration={{ ...configuration, httpClient: axios }} mapping={mapping} page={page}>
    <header>
      <nav className="navbar navbar-expand-sm navbar-dark sticky-top bg-dark" role="navigation">
        <div className="container">
          <BrPageContext.Consumer>
            {(contextPage) => (
              <Link className="navbar-brand" href={contextPage?.getUrl('/') ?? ''}>
                {contextPage?.getTitle() || 'brXM + Next.js = ♥️'}
              </Link>
            )}
          </BrPageContext.Consumer>
          <div className="collapse navbar-collapse">
            <BrComponent path="menu">
              <Menu />
            </BrComponent>
          </div>
        </div>
      </nav>
    </header>
    <section className="container flex-fill pt-3">
      <BrComponent path="main" />
    </section>
    <footer className="bg-dark text-light py-3">
      <div className="container clearfix">
        <div className="float-left pr-3">&copy; Bloomreach</div>
        <div className="overflow-hidden">
          <BrComponent path="footer" />
        </div>
      </div>
    </footer>
  </BrPage>
}

export default BrxApp;
