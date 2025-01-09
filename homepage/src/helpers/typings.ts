import { LocaleParsed } from "@devographics/i18n";
import { GeneralMetadata, SurveyMetadata } from "@devographics/types";

/**
 * Props that are drilled down
 * We could use Astro.locals, but drilling is ok for this simple app
 */
export interface CommonProps {
  survey: SurveyMetadata;
  surveys: SurveyMetadata[];
  locale: LocaleParsed;
  locales: LocaleParsed[];
  generalMetadata: GeneralMetadata;
}
