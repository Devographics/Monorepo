import { serverConfig } from "~/config/server";
import sortBy from "lodash/sortBy.js";
import fetch from "node-fetch";
import get from "lodash/get.js";
import { cachedPromise, promisesNodeCache } from "~/lib/server/caching";
import { print } from "graphql/language/printer.js";
import gql from "graphql-tag";
import { Entity } from "@devographics/core-models/entities/typings";

const entitiesPromiseCacheKey = "entitiesPromise";

/** Query sent to the translation API => load all entitites */
const entitiesQuery = print(gql`
  query EntitiesQuery {
    entities(isNormalization: true) {
      id
      name
      tags
      type
      category
      description
      patterns
      apiOnly
      twitterName
      companyName
      company {
        name
        homepage {
          url
        }
      }
    }
  }
`);

/**
 * Fetch raw entities from the trasnlation API
 * @returns
 */
export const fetchEntities = async () => {
  const response = await fetch(serverConfig.translationAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: entitiesQuery, variables: {} }),
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

export const getOrFetchEntities = async ({
  tags,
  name,
  id,
  ids,
  forceLoad,
}: {
  tags?: any[];
  name?: any;
  id?: any;
  ids?: any[];
  forceLoad?: boolean;
} = {}) => {
  try {
    let entities = forceLoad
      ? await fetchEntities()
      : await cachedPromise(
          promisesNodeCache,
          entitiesPromiseCacheKey,
          ENTITIES_PROMISE_TTL_SECONDS
        )(async () => await fetchEntities());

    // const { tags, name, id, ids } = args;

    if (tags) {
      // filter by tags
      entities = entities.filter((e) =>
        tags.every((t) => e.tags && e.tags.includes(t))
      );
    }

    if (name) {
      if (name._like) {
        // filter by keyword search on the name
        entities = entities.filter((e) =>
          e.name.toLowerCase().includes(name._like.toLowerCase())
        );
      }
    }

    if (id) {
      if (id._in) {
        // filter to only include a subset by id
        entities = entities.filter((e) => id._in.includes(e.id));
      }
    }

    if (ids) {
      // filter to only include a subset by id
      entities = entities.filter((e) => ids.includes(e.id));
    }

    entities = sortBy(entities, "name");

    return entities;
  } catch (err) {
    return [];
  }
};
