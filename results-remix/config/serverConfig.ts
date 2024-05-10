import {
    getEnvVar,
    EnvVar,
    setAppName,
    setEnvMap,
} from "@devographics/helpers";
import { AppName } from "@devographics/types";

setEnvMap(import.meta.env);
setAppName(AppName.RESULTS_ASTRO);

export function serverConfig() {
    const editionId = getEnvVar(EnvVar.EDITIONID);
    const surveyId = getEnvVar(EnvVar.SURVEYID);
    return { editionId, surveyId }

}