import type { NextApiRequest, NextApiResponse } from "next";

import gql from "graphql-tag";
import { serverConfig } from "~/config/server";
import { print } from "graphql";
import { ResponseDocument, SurveyEdition } from "@devographics/core-models";
import { connectToRedis } from "~/lib/server/redis";

export default async function responseHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // await connectToAppDb()
  connectToRedis();
  // TODO: this code used to be a client-side graphql query
  // we reuse the same call temporarily to facilitate moving out of graphql
  const headers = {
    ...req.headers,
    "content-type": "application/json",
  };
  delete headers.connection;
  const response = await fetch(serverConfig().appUrl + "/api/graphql", {
    method: "POST",
    // @ts-ignore
    headers: req.headers,
    // TODO: this query doesn't consider the survey slug
    body: JSON.stringify({
      query: print(gql`
        query getCurrentUser {
          currentUser {
            ...UsersCurrentSurveyAction
            __typename
          }
        }

        fragment UsersCurrentSurveyAction on User {
          _id
          username
          createdAt
          isAdmin
          groups
          responses {
            _id
            pagePath
            editionId
            surveyId
            completion
            createdAt
            survey {
              slug
              surveyId
              editionId
              prettySlug
              name
              year
              domain
              status
              imageUrl
              faviconUrl
              socialImageUrl
              resultsUrl
            }
          }
          __typename
        }
      `),
    }),
  });
  const data = await response.json();
  console.log("GOT DATA FROM GRAPHQL CALL", data);
  const responses: Array<ResponseDocument & { survey: SurveyEdition }> =
    data?.data?.currentUser?.responses || [];
  res.status(200).json(responses);
}
