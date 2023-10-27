import { cache } from "react";
import {
  fetchAllLocalesIds,
  fetchAllLocalesMetadata,
  fetchLocaleConverted,
} from "@devographics/fetch";
import { AppName } from "@devographics/types";

const LOCALE_TTL_SEC = 5 * 60

/**
 * Will cache per localeId and contexts
 * /!\ Will not automatically merge cache if contexts are repeated
 * (eg fetching ["general"] then ["general", "survey"])
 */
export const rscLocale = cache((options: any) => fetchLocaleConverted({ ...(options || {}), ttlSec: LOCALE_TTL_SEC }));

export const rscAllLocalesMetadata = cache((options?: any) =>
  fetchAllLocalesMetadata({ ...(options || {}), ttlSec: LOCALE_TTL_SEC })
);
export const rscAllLocalesIds = cache(() =>
  fetchAllLocalesIds({ appName: AppName.SURVEYFORM, ttlSec: LOCALE_TTL_SEC })
);
