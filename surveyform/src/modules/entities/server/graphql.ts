import sortBy from "lodash/sortBy.js";
import fetch from "node-fetch";
import get from "lodash/get.js";
import { serverConfig } from "~/config/server";
import { cachedPromise, promisesNodeCache } from "~/lib/server/caching";
const translationAPI = serverConfig.translationAPI; //getSetting("translationAPI");
const disableAPICache = false; //getSetting("disableAPICache", false);

const entitiesPromiseCacheKey = "entitiesPromise";
/*

Entities

*/
export const entityType = `type Entity {
  id: String
  name: String
  homepage: Homepage
  category: String
  npm: String
  description: String
  type: String
  tags: [String]
  mdn: JSON
  patterns: [String]
  twitterName: String
  twitter: Twitter
  companyName: String
  company: Entity
}`;

/** Query sent to the translation API => load all entitites */
const entitiesQuery = `query EntitiesQuery {
  entities {
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
  }
}
`;

interface Entity {
  id: string;
  name: string;
  tags?: Array<string>;
}

/**
 * Fetch raw entities from the translation API
 * @returns
 */
export const fetchEntities = async () => {
  const response = await fetch(process.env.TRANSLATION_API!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: entitiesQuery, variables: {} }),
  });
  const json = await response.json();
  if (json.errors) {
    console.log("// entities API query error");
    console.log(JSON.stringify(json.errors, null, 2));
    throw new Error();
  }
  const entities = get(json, "data.entities") as Array<Entity>;
  return entities;
};

const ENTITIES_PROMISE_TTL_SECONDS = 10 * 60;

/**
 * @param root
 * @param args
 * @returns
 */
export const entitiesTypeDefs =
  "entities(tags: [String], ids: [String], name: String_Selector, id: String_Selector): [Entity]";
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

export const getOrFetchEntities = async ({
  tags,
  name,
  id,
  ids,
}: {
  tags?: any[];
  name?: any;
  id?: any;
  ids?: any[];
} = {}) => {
  try {
    let entities = await cachedPromise(
      promisesNodeCache,
      entitiesPromiseCacheKey,
      ENTITIES_PROMISE_TTL_SECONDS,
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
