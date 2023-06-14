import { withSentry } from "@sentry/nextjs";
export const apiWrapper = (routeFunction) => withSentry(routeFunction);
