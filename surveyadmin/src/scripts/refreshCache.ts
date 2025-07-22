import {
  refreshSurveysCache as refreshSurveysCache_,
  refreshLocalesCache as refreshLocalesCache_,
} from "@devographics/fetch";

export const refreshSurveysCache = () => {
  return refreshSurveysCache_({});
};
refreshSurveysCache.category = "utilities";

export const refreshLocalesCache = () => {
  return refreshLocalesCache_({});
};
refreshLocalesCache.category = "utilities";
