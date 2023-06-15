import { cache } from "react";
import { fetchAllLocalesMetadata, fetchLocale } from "./fetch";

/**
 * Will cache per localeId and contexts
 * /!\ Will not automatically merge cache if contexts are repeated
 * (eg fetching ["general"] then ["general", "survey"])
 */
export const rscLocale = cache(async (...args: Parameters<typeof fetchLocale>) => fetchLocale(...args));

export const rscAllLocalesMetadata = cache(() => fetchAllLocalesMetadata())