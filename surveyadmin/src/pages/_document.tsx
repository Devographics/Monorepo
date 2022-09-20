// @see https://github.com/mui-org/material-ui/blob/master/examples/nextjs/pages/_document.js
import React from "react";
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  //DocumentInitialProps,
} from "next/document";
import theme from "~/lib/style/defaultTheme";
import {
  getAppEnhancer as getMuiAppEnhancer,
  //getMuiDocumentInitialProps,
} from "@vulcanjs/next-mui/server";
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
          <meta name="theme-color" content={theme.palette.primary.main} />
          {/* @see https://next.material-ui.com/getting-started/installation/ */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=IBM+Plex+Mono:300,300i,600&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
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
  const muiAppEnhancer = getMuiAppEnhancer();
  const enhancers = [muiAppEnhancer];

  // Enhance Next page renderer so it also applies MUI stylesheets collectors
  const originalRenderPage = ctx.renderPage;
  try {
    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => {
          const enhanced = enhancers.reduce((_enhanced, enhancer) => {
            return enhancer.enhanceApp(_enhanced);
          }, App);
          return enhanced(props);
          //return scAppEnhancer.enhanceApp(muiAppEnhancer.enhanceApp(App))(props);
        },
      });

    // Run the renderer
    const initialProps = await Document.getInitialProps(ctx);
    const html = initialProps.html;

    // i18n with next-i18n
    const i18nDocumentProps = i18nPropsFromCtx(ctx);
    // i18n with our custom cookie system
    /*
    Next already handles that for us
    if (ctx.req) {
      const locale = getLocaleFromReq(ctx.req);
      if (locale) {
        i18nDocumentProps.lang = locale.slice(0, 2);
      }
    }*/

    return {
      ...initialProps,
      i18nDocumentProps,
      // Stylesheets have been collected during the getInitialProps call, we can now get the styles
      styles: (
        <>
          {initialProps.styles}
          {enhancers.map((e) => e.sheets.getStyleElements(html))}
        </>
      ),
    };
  } finally {
    enhancers.forEach((e) => {
      if (e.finally) e.finally(); // for example will seal stylesheet for Styled Components
    });
  }
};
