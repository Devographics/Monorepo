import { captureException } from "@sentry/nextjs";

const TestSentry = () => {
  captureException("Sentry test");
  return <div>Triggering server-side test error…</div>;
};

export default TestSentry;
