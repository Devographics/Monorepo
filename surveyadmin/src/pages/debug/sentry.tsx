import { captureException, captureMessage } from "@sentry/nextjs";
import { useState } from "react";
import { ErrorBoundary } from "~/core/components/error";

const SentryPage = () => {
  const [showBadComponent, setShowBadComponent] = useState(false);
  const throwAnError = () => {
    throw new Error("Error from component");
  };
  return (
    <div>
      <h1>Debug Sentry</h1>
      <p>Should trigger client-side exceptions</p>
      <button
        onClick={() => {
          captureException(new Error("Sentry debug exception"));
        }}
      >
        Capture an exception
      </button>
      <button
        onClick={() => {
          captureException(new Error("Sentry debug exception with info"), {
            extra: {
              foo: "bar",
              someArray: [1, 2, 3],
              someError: new Error("Nested error"),
            },
          });
        }}
      >
        Capture an exception with error info
      </button>
      <button
        onClick={() => {
          captureMessage("A message");
        }}
      >
        Capture a message
      </button>
      <button
        onClick={() => {
          // NOTE: event handler error are NOT reachable by ErrorBoundary!
          // @see
          throw new Error("Error from event handler");
        }}
      >
        Throw an error in event handler
      </button>
      {/*
      <button
        onClick={() => {
          setShowBadComponent(true);
        }}
      >
        Throw an error during component render
      </button>
      <ErrorBoundary>{showBadComponent && throwAnError()}</ErrorBoundary>
      */}
    </div>
  );
};

import { getLocaleStaticProps } from "~/i18n/server/ssr";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default SentryPage;
