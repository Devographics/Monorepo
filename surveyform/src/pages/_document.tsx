import React from "react";
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  //DocumentInitialProps,
} from "next/document";
import {
  i18nPropsFromCtx,
  DocumentLanguageProps,
  //getLocaleFromReq,
} from "~/i18n/server/localeDetection";

interface VNSDocumentProps {
  i18nDocumentProps: Partial<DocumentLanguageProps>;
}
export default class MyDocument extends Document<VNSDocumentProps> {
  render() {
    const { i18nDocumentProps } = this.props;
    return (
      <Html
        {...i18nDocumentProps}
        data-app-version={process.env.NEXT_PUBLIC_PKGINFO_VERSION}
      >
        <Head>
          {/* PWA primary color */}
          {/*<meta name="theme-color" content={theme.palette.primary.main} />*/}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=IBM+Plex+Mono:300,300i,600&display=swap"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with server-side generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  // Run the renderer
  const initialProps = await Document.getInitialProps(ctx);

  // i18n with next-i18n
  const i18nDocumentProps = i18nPropsFromCtx(ctx);

  return {
    ...initialProps,
    i18nDocumentProps,
  };
};
