import {
  refreshSurveysCache as refreshSurveysCache_,
  refreshLocalesCache as refreshLocalesCache_,
} from "@devographics/fetch";

export const refreshSurveysCache = refreshSurveysCache_;
refreshSurveysCache.category = "utilities";

export const refreshLocalesCache = refreshLocalesCache_;
refreshLocalesCache.category = "utilities";
