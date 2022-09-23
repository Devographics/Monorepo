import { getOrFetchEntities } from "./fetchEntities";

/*

Entities

*/
// export const entityType = `type Entity {
//   id: String
//   name: String
//   homepage: Homepage
//   category: String
//   npm: String
//   description: String
//   type: String
//   tags: [String]
//   mdn: JSON
//   patterns: [String]
//   twitterName: String
//   twitter: Twitter
//   companyName: String
//   company: Entity
//   example: Example
// }`;


// export const exampleType = `type Example {
//   language: String
//   code: String
// }`;

/**
 *
 * @param root
 * @param args
 * @returns
 */
export const entitiesTypeDefs =
  "entities(tags: [String], ids: [String], name: String_Selector, id: String_Selector): [JSON]";

// legacy typed version

// export const entitiesTypeDefs =
//   "entities(tags: [String], ids: [String], name: String_Selector, id: String_Selector): [Entity]";

/**
 * Get entities from the translation API and parse them
 * Will use a cached promise to avoid multiple calls
 * @param root
 * @param args
 * @returns
 */
export const entitiesResolver = async (root, args) => {
  return getOrFetchEntities(args);
};
