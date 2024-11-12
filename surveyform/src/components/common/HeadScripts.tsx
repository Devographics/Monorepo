import Script from "next/script";
import PlausibleProvider from "next-plausible";

export function HeadScripts() {
  return (
    <>
      {/**
       * Source: https://vanillajstoolkit.com/polyfills/stringreplaceall/
       * needed for older versions of iOS Safari
       * At time of writing replaceAll has less than 95% support
       * @see https://caniuse.com/?search=replaceAll
       */}
      <Script src="/polyfills/replaceAll.js" strategy="beforeInteractive" />
      {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
        <PlausibleProvider
          trackLocalhost={true}
          domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
        />
      )}
    </>
  );
}
