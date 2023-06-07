import { cache } from "react";
import { fetchAllLocalesMetadata, fetchLocale } from "./fetch";
export const rscLocale = cache(async (...args: Parameters<typeof fetchLocale>) => fetchLocale(...args));
export const rscAllLocalesMetadata = cache(() => fetchAllLocalesMetadata())