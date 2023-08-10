export function getConfig() {
    return {
        /**
         * Devographics API
         */
        chartDataApi: process.env.API_URL!, // TODO: reuse name from variables yml
        /**
         * Absolute URL of the application that serves the charts
         * @example https://og.devographics.com/
         */
        appUrl: process.env.APP_URL!,
        port: process.env.PORT || 4444
    }

}