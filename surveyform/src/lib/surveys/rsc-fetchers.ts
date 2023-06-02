
import { cache } from "react";
import { serverConfig } from "~/config/server";
import { fetchSurveysMetadata } from "~/lib/api/fetch";

export const rscFetchSurveysMetadata = cache(async () => {
    const surveys = await fetchSurveysMetadata({ calledFrom: __filename });
    if (serverConfig().isProd && !serverConfig()?.isTest) {
        return surveys.filter((s) => s.id !== "demo_survey");
    }
    return surveys;
});