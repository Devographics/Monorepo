import { AppName, setAppName, getConfig } from "@devographics/helpers";

export async function register() {
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
