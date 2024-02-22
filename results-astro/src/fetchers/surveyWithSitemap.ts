
import {
    getEnvVar,
    EnvVar,
} from "@devographics/helpers";
import { fetchEditionSitemap } from "@devographics/fetch";

export async function astroSurveyWithSitemap() {
    // Each survey edition has its own domain
    // so we can stick to global env variable to pick the edition we want
    const editionId = getEnvVar(EnvVar.EDITIONID);
    const surveyId = getEnvVar(EnvVar.SURVEYID);
    const surveyWithSitemap = await fetchEditionSitemap({ editionId, surveyId });
    return surveyWithSitemap.data;
}