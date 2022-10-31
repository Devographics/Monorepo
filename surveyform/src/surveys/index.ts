// import js2019 from "./js/js2019outline";
// import css2020 from "./js/css2020outline";
// import js2020 from "./js/js2020outline";
// import css2021 from "./js/css2021outline";

import css2020 from "./stateofcss/css2020.yml";
import css2021 from "./stateofcss/css2021.yml";
import css2022 from "./stateofcss/css2022.yml";

import js2019 from "./stateofjs/js2019.yml";
import js2020 from "./stateofjs/js2020.yml";
import js2021 from "./stateofjs/js2021.yml";
import js2022 from "./stateofjs/js2022.yml";

import graphql2022 from "./stateofgraphql/graphql2022.yml";

import { parseSurvey } from "~/modules/surveys/parser/parseSurvey";

// make sure array is properly sorted here
import { SurveyType } from "@devographics/core-models";

export const surveys: Array<SurveyType> = [
  // @ts-ignore
  js2022,
  // @ts-ignore
  css2022,
  // @ts-ignore
  graphql2022,
  // @ts-ignore
  js2021,
  // @ts-ignore
  css2021,
  // @ts-ignore
  js2020,
  // @ts-ignore
  css2020,
  // @ts-ignore
  js2019,
];

if (
  process.env.NEXT_PUBLIC_NODE_ENV === "test" ||
  process.env.NODE_ENV !== "production"
) {
  const { testSurvey } = require("./testSurvey");
  surveys.push(testSurvey);
}

/**
 * FOR REACT CODE, USE surveyWithTemplates INSTEAD
 *
 * This version doesn't include templates and thus do not load any JSX code
 */
const parsedSurveys: Array<SurveyType> = surveys.map(parseSurvey);

export default parsedSurveys;
