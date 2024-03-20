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
