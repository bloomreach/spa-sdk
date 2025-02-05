/*
 * Copyright 2024-2025 Bloomreach
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

import { ReactNode } from 'react';

import './app.css';

export default function RootLayout({children}: { children: ReactNode }) {
  return (
    <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <meta name="description" content="Example Next.js SPA for Bloomreach Experience"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>

      <link rel="shortcut icon" type="image/png" href="/favicon.png" sizes="64x64"/>
      <link
        rel="stylesheet"
        media="screen"
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossOrigin="anonymous"
      />

      <title>brXM + Next.js = ♥️</title>
    </head>
    <body>
      <div className="d-flex flex-column vh-100">
        {children}
      </div>
    </body>
    </html>
  )
}
