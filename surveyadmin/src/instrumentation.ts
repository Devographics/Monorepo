import { setAppName, getConfig } from "@devographics/helpers";
import { AppName } from "@devographics/types";

export async function register() {
  // Will run only at runtime, we also need to init the config at build time via the layout
  setAppName(AppName.SURVEYADMIN);
  const isDev = process.env.NODE_ENV === "development";
  // call getConfig the first time and show warnings if this is local dev env
  getConfig({ appName: AppName.SURVEYADMIN, showWarnings: isDev });

  // if (process.env.NEXT_RUNTIME === 'nodejs') {
  //   await import('./instrumentation-node');
  // }

  // if (process.env.NEXT_RUNTIME === 'edge') {
  //   await import('./instrumentation-edge');
  // }
}
