import set from "lodash/set.js";
// TODO: should be imported dynamically
import countries from "../normalize/countries";
import { logToFile } from "@devographics/debug";
import { NormalizationParams } from "../types";

export const country = async ({ normResp, log }: NormalizationParams) => {
  /*
  
    5c. Normalize country (if provided)
    
    */
  if (normResp?.user_info?.country) {
    set(normResp, "user_info.country_alpha2", normResp.user_info.country);
    const countryNormalized = countries.find(
      (c) => c["alpha-2"] === normResp?.user_info?.country
    );
    if (countryNormalized) {
      set(normResp, "user_info.country_name", countryNormalized.name);
      set(normResp, "user_info.country_alpha3", countryNormalized["alpha-3"]);
    } else {
      if (log) {
        await logToFile(
          "countries_normalization.txt",
          normResp.user_info.country
        );
      }
    }
  }
};
