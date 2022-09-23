import { serverConfig } from "~/config/server";
import sortBy from "lodash/sortBy.js";
import fetch from "node-fetch";
import get from "lodash/get.js";
import { cachedPromise, promisesNodeCache } from "~/lib/server/caching";
import { print } from "graphql/language/printer";
import gql from "graphql-tag";
import { Entity } from "@devographics/core-models/entities/typings";

/** Query sent to the translation API => load all entitites */
const entitiesQuery = print(gql`
  query EntitiesQuery($ids: [String] = "") {
    entities(ids: $ids) {
      id
      name
      tags
      type
      category
      description
      patterns
      apiOnly
      mdn {
        locale
        url
        title
        summary
      }
      twitterName
      twitter {
        userName
        avatarUrl
      }
      companyName
      company {
        name
        homepage {
          url
        }
      }
      example {
        language
        code
      }
    }
  }
`);

/**
 * Fetch raw entities from the trasnlation API
 * @returns
 */
export const fetchEntities = async (variables) => {
  const response = await fetch(serverConfig.translationAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: entitiesQuery, variables }),
  });
  const json: any = await response.json();
  if (json.errors) {
    console.log("// entities API query error");
    console.log(JSON.stringify(json.errors, null, 2));
    throw new Error();
  }
  const entities = get(json, "data.entities") as Array<Entity>;
  return entities;
};

const ENTITIES_PROMISE_TTL_SECONDS = 10 * 60;

const getEntitiesPromiseCacheKey = ({ ids, tags }: EntitiesVariables) =>
  `entitiesPromise__ids:[${ids?.join(",")}]__tags[${tags?.join(",")}]`;

type EntitiesVariables = {
  tags?: string[];
  ids?: string[];
};

export const getOrFetchEntities = async (variables: EntitiesVariables = {}) => {
  try {
    let entities = await cachedPromise(
      promisesNodeCache,
      getEntitiesPromiseCacheKey(variables),
      ENTITIES_PROMISE_TTL_SECONDS
    )(async () => await fetchEntities(variables));
    return entities;
  } catch (err) {
    return [];
  }
};
