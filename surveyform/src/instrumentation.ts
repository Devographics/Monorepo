import { setAppName, getConfig } from "@devographics/helpers";
import { AppName } from "@devographics/types";

export async function register() {
  /**
   * NOTE: this will only set the config/env variables at runtime
   * => this approach works only for API routes/route handlers that are not called at build-time
   * For pages, uses a layout instead
   */
  setAppName(AppName.SURVEYFORM);
  const isDev = process.env.NODE_ENV === "development";
  // call getConfig the first time and show warnings if this is local dev env
  getConfig({ showWarnings: isDev });

  // if (process.env.NEXT_RUNTIME === 'nodejs') {
  //   await import('./instrumentation-node');
  // }

  // if (process.env.NEXT_RUNTIME === 'edge') {
  //   await import('./instrumentation-edge');
  // }
}
