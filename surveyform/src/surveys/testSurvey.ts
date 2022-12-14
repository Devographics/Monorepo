import graphql2022 from "./stateofgraphql/graphql2022.yml";
/** FOR E2E TESTING PURPOSE ONLY */
export const testSurvey = {
  ...graphql2022,
  status: 2,
  name: "Demo survey",
  slug: "demo_survey",
  prettySlug: "demo-survey",
};
