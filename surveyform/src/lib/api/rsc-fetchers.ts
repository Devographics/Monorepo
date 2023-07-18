import { cache } from "react";
import {
  fetchAllLocalesIds,
  fetchAllLocalesMetadata,
  fetchLocale,
} from "@devographics/fetch";
import { AppName } from "@devographics/types";

/**
 * Will cache per localeId and contexts
 * /!\ Will not automatically merge cache if contexts are repeated
 * (eg fetching ["general"] then ["general", "survey"])
 */
export const rscLocale = cache((options: any) =>
  fetchLocale({ ...options, appName: AppName.SURVEYFORM })
);

export const rscAllLocalesMetadata = cache((options?: any) =>
  fetchAllLocalesMetadata({ ...options, appName: AppName.SURVEYFORM })
);
export const rscAllLocalesIds = cache(() =>
  fetchAllLocalesIds({ appName: AppName.SURVEYFORM })
);
