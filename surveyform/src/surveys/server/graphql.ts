/*

Note: not used yet, for now surveys are still bundled locally from YAML

*/

import fetch from "node-fetch";
import get from "lodash/get.js";
import { serverConfig } from "~/config/server";
import { nodeCache } from "~/lib/server/caching";
const translationAPI = serverConfig().translationAPI; //getSetting("translationAPI");
const disableAPICache = false; //getSetting("disableAPICache", false);

const surveysPromiseCacheKey = "surveysPromise";

/*

Entities

*/
export const surveyType = `type Survey {
  domain: String
  hashtag: String
  name: String
  slug: String

}`;

export const editionType = `type SurveyEdition {
  surveyId: String
  createdAt: Date
  year: Number
  status: Number
  shareUrl: String
  resultsUrl: String
  imageUrl: String
  socialImageUrl: String
  faviconUrl: String
}`;

const surveysQuery = `query SurveysQuery{
  surveys {
    domain
    hashtag
    name
    slug
    editions {
      surveyId
      createdAt
      year
      status
      shareUrl
      resultsUrl
      imageUrl
      faviconUrl
      socialImageUrl
    }
  }
}
`;

interface Survey {
  domain: string;
  hashtag: string;
  name: string;
  slug: string;
}

const fetchSurveys = async () => {
  const response = await fetch(translationAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: surveysQuery, variables: {} }),
  });
  const json: any = await response.json();
  if (json.errors) {
    console.log("// surveysQuery API query error");
    console.log(JSON.stringify(json.errors, null, 2));
    throw new Error();
  }
  const surveys = get(json, "data.surveys") as Array<Survey>;
  console.log("// fetchSurveys");
  console.log(surveys);
  return surveys;
};

/**
 * Get surveys from the translation API
 * Will use a cached promise to avoid multiple calls
 * @param root
 * @param args
 * @returns
 */
export const surveysResolver = async (root, args) => {
  // get promise from cache, or trigger a new one
  let surveysPromise = nodeCache.get(surveysPromiseCacheKey) as Promise<
    Array<Survey>
  >;
  if (disableAPICache || !surveysPromise) {
    surveysPromise = fetchSurveys();
    nodeCache.set(surveysPromiseCacheKey, surveysPromise);
  }

  const surveys = await surveysPromise;

  return surveys;
};
