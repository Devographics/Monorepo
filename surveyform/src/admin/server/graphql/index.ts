/**
 * Custom graphql API for state of JS
 * = resolvers that are created manually and not using Vulcan models/collections
 */
import { nodeCache, promisesNodeCache } from "~/lib/server/caching";
// TODO: make those import working ok
//import Saves from "../modules/saves/collection";
//import Responses from "../modules/responses/collection";
//import NormalizedResponses from "../modules/normalized_responses/collection";

import { ResponseMongoCollection } from "~/modules/responses/model.server";
import { isAdmin } from "@vulcanjs/permissions";
import { SaveMongoCollection } from "~/modules/saves/model.server";
import {
  normalizeIdsTypeDefs,
  normalizeIds,
  surveyNormalizationTypeDefs,
  surveyNormalization,
} from "./normalization";
import {
  entitiesResolver,
  entitiesTypeDefs,
  entityType,
} from "~/modules/entities/server/graphql";
import {
  localeResolver,
  localesQueryTypeDef,
  localesResolver,
  surveyLocaleType,
} from "~/i18n/server/graphql";
// import {
//   surveysResolver,
//   surveyType,
//   editionType,
// } from "~/modules/surveys/server/graphql";

const { mergeResolvers, mergeTypeDefs } = require("@graphql-tools/merge");
// Simulate Vulcan Meteor global "addGraphQLSchema" etc.
const gqlObjectTypedefsRegistry: Array<string> = [];
const gqlQueryTypedefsRegistry: Array<string> = [];
const gqlMutationTypedefsRegistry: Array<string> = [];
const gqlResolversRegistry: Array<any> = [];

const addGraphQLSchema = (t: string) => gqlObjectTypedefsRegistry.push(t);
const addGraphQLMutation = (mt: string) => gqlMutationTypedefsRegistry.push(mt);
const addGraphQLQuery = (qt: string) => gqlQueryTypedefsRegistry.push(qt);
const addGraphQLResolvers = (r: any) => gqlResolversRegistry.push(r);

/*

Survey Type

*/
const surveyType = `type Survey {
  slug: String
  domain: String
  prettySlug: String
  name: String 
  year: Float 
  status: Float 
  imageUrl: String 
  resultsUrl: String
}`;

addGraphQLSchema(surveyType);

/*

Cache

*/

/**
 * NOTE: this is not bullet-proof, you can only clear
 * the cache of a given instance
 *
 * So it will work of for "/api/graphql" but not if
 * you clean the cache of another endpoint
 * @param root
 * @param args
 * @param param2
 * @returns
 */
const clearCache = (root, args, { currentUser }) => {
  if (!isAdmin(currentUser)) {
    throw new Error("You cannot perform this operation");
  }
  nodeCache.flushAll();
  promisesNodeCache.flushAll();
  return nodeCache.getStats();
};

addGraphQLMutation("clearCache: JSON");
addGraphQLResolvers({ Mutation: { clearCache } });

const cacheStats = (root, args, { currentUser }) => {
  if (!isAdmin(currentUser)) {
    throw new Error("You cannot perform this operation");
  }
  return { keys: nodeCache.keys(), stats: nodeCache.getStats() };
};

addGraphQLQuery("cacheStats: JSON");
addGraphQLResolvers({ Query: { cacheStats } });

addGraphQLSchema(surveyLocaleType);
addGraphQLQuery(localesQueryTypeDef);
addGraphQLResolvers({ Query: { locales: localesResolver } });
addGraphQLResolvers({ Query: { locale: localeResolver } });

const homepageType = `type Homepage {
  name: String
  url: String
}`;

addGraphQLSchema(homepageType);

const twitterType = `type Twitter {
  userName: String
  avatarUrl: String
}
`;

addGraphQLSchema(twitterType);

addGraphQLSchema(entityType);
addGraphQLQuery(entitiesTypeDefs);
addGraphQLResolvers({ Query: { entities: entitiesResolver } });

// /*

// Surveys (not used yet)

// */
// addGraphQLSchema(surveyType);
// addGraphQLSchema(editionType);
// addGraphQLQuery(
//   "surveys: [Survey]"
// );
// addGraphQLResolvers({ Query: { surveys: surveysResolver } });

/*

Stats

*/
const statsType = `type Stats {
  contents: JSON
}`;

addGraphQLSchema(statsType);

const formatResult = (r, unit) => `${Math.round(r)}${unit}`;

const stats = async () => {
  const saves = (await SaveMongoCollection()
    .aggregate([
      { $group: { _id: null, average: { $avg: "$duration" } } },
      { $sort: { createdAt: -1 } },
      { $limit: 100 },
    ])
    .toArray()) as Array<{ average: any }>;

  const responses = (await ResponseMongoCollection()
    .aggregate([
      { $group: { _id: null, averageCompletion: { $avg: "$completion" } } },
    ])
    .toArray()) as Array<{ averageCompletion: any }>;

  const responsesOver50 = (await ResponseMongoCollection()
    .aggregate([
      { $match: { completion: { $gte: 50 } } },
      { $group: { _id: null, averageDuration: { $avg: "$duration" } } },
    ])
    .toArray()) as Array<{ averageDuration: any }>;

  return {
    contents: {
      averageSaveDuration: formatResult(saves[0].average, "ms"),
      averageCompletionRate: formatResult(responses[0].averageCompletion, "%"),
      averageCompletionDuration: formatResult(
        responsesOver50[0] && responsesOver50[0].averageDuration,
        "min"
      ),
    },
  };
};

addGraphQLQuery("stats: Stats");
addGraphQLResolvers({ Query: { stats } });

addGraphQLQuery(surveyNormalizationTypeDefs);
addGraphQLResolvers({ Query: { surveyNormalization } });

addGraphQLMutation(normalizeIdsTypeDefs);
addGraphQLResolvers({ Mutation: { normalizeIds } });

// Final merge

export const typeDefs = mergeTypeDefs([
  ...gqlObjectTypedefsRegistry,
  `type Query {\n${gqlQueryTypedefsRegistry.join("\n")}}`,
  `type Mutation {\n${gqlMutationTypedefsRegistry.join("\n")}}`,
]);

export const resolvers = mergeResolvers(gqlResolversRegistry);
