import type { SurveyEdition } from "@devographics/core-models";

export interface ExportOptions {
  format: {
    json?: boolean;
    jsonExplanation?: boolean;
    csv?: boolean;
    csvExplanation?: boolean;
    mongoDump?: boolean;
  };
  editionId: SurveyEdition["id"];
  /**
   * Not yet used
   *
   * In the future we could allow to pass some parameters
   * to filter data and improve the query
   * Eg exporting only responses for certain kind of users
   *
   * /!\ never allow to pass a custom query, only filter option
   * that we then parse server-side to build a query
   */
  filters?: never;
}
// To be passed as URL params
export interface ExportOptionsStr {
  format: {
    json?: "true" | "false";
    jsonExplanation?: "true" | "false";
    csv?: "true" | "false";
    csvExplanation?: "true" | "false";
    mongoDump?: "true" | "false";
  };
  surveySlug: SurveyEdition["slug"];
  /**
   * Not yet used
   *
   * In the future we could allow to pass some parameters
   * to filter data and improve the query
   * Eg exporting only responses for certain kind of users
   *
   * /!\ never allow to pass a custom query, only filter option
   * that we then parse server-side to build a query
   */
  filters?: never;
}
