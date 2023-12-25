import { fetchEntities } from "@devographics/fetch";

export const getEntitiesNormalizationQuery = () => `
query EntitiesQuery {
  entities(includeNormalizationEntities: true, includeAPIOnlyEntities: false) {
    id
    parentId
    nameClean
    nameHtml
    twitterName
    tags
    exactMatch
    patterns
  }
}
`;

export const fetchEntitiesNormalization = async (options = {}) =>
  await fetchEntities({
    getQuery: getEntitiesNormalizationQuery,
    ...options,
  });
