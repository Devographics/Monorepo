import graphql2022 from "./stateofgraphql/graphql2022.yml";
/** FOR E2E TESTING PURPOSE ONLY */
export const testSurvey = {
  ...graphql2022,
  status: 2,
  name: "Graphql survey demo",
  slug: "graphql_demo",
  prettySlug: "graphql-demo",
};
