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

import { BrComponent, BrPage, BrPageContext } from '@bloomreach/react-sdk';
import { Configuration, extractSearchParams } from '@bloomreach/spa-sdk';
import axios from 'axios';
import React, { JSX, StrictMode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Banner, Content, Menu, NewsList } from './components';

export default function App(): JSX.Element {
  const location = useLocation();

  let configuration: Configuration = {
    path: `${location.pathname}${location.search}`,
    endpoint: process.env.REACT_APP_BRXM_ENDPOINT,
    httpClient: axios,
    debug: true,
  };

  if (!process.env.REACT_APP_BRXM_ENDPOINT && process.env.REACT_APP_BR_MULTI_TENANT_SUPPORT) {
    const endpointQueryParameter = 'endpoint';
    const { searchParams } = extractSearchParams(configuration.path!, [endpointQueryParameter].filter(Boolean));

    configuration = {
      ...configuration,
      endpoint: searchParams.get(endpointQueryParameter) ?? '',
      baseUrl: `?${endpointQueryParameter}=${searchParams.get(endpointQueryParameter)}`,
    };
  }

  const mapping = { Banner, Content, 'News List': NewsList, 'Simple Content': Content };

  return (
    <StrictMode>
      <BrPage configuration={configuration} mapping={mapping}>
        <header>
          <nav className="navbar navbar-expand-sm navbar-dark sticky-top bg-dark" role="navigation">
            <div className="container">
              <BrPageContext.Consumer>
                {(page) => page
                  && (
                    <Link to={page.getUrl('/')} className="navbar-brand">
                      {page.getTitle() || 'brXM + React = ♥️'}
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
    </StrictMode>
  );
}
