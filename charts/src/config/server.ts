import "dotenv/config"
import { getConfig } from "@devographics/helpers"

/**
 * Shared config of the Devographics infrastructure
 * Variables must be listed in "shared/helpers/variables.yml"
 * (unless they are strictly specific to the ogchart app)
 */
const devographicsEnv = getConfig()

export function getAppConfig() {
    const port = devographicsEnv.PORT || 4444
    return {
        /**
         * Devographics API
         */
        chartDataApi: devographicsEnv.API_URL!,
        port,
        /**
         * Absolute URL of the application that serves the charts
         * @example https://share.devographics.com/
         */
        appUrl: process.env.APP_URL || "http://localhost:" + port,
        isDev: process.env.NODE_ENV === "development",
        isDebug: !!process.env.DEBUG
    }
}