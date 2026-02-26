import type { ReactNode } from 'react'

import { Main } from '../main'

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>results-waku</title>
      </head>
      <body>
        <Main>{children}</Main>
      </body>
    </html>
  )
}
