export function getConfig() {
    const port = process.env.PORT || 4444
    return {
        /**
         * Devographics API
         */
        chartDataApi: process.env.API_URL!, // TODO: reuse name from variables yml
        port,
        /**
         * Absolute URL of the application that serves the charts
         * @example https://og.devographics.com/
         */
        appUrl: process.env.APP_URL || "http://localhost:" + port,
    }

}