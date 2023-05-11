import gql from "graphql-tag";
import type { NextApiRequest, NextApiResponse } from "next";
import { serverConfig } from "~/config/server";
import { print } from "graphql";
import { gqlHeaders } from "~/core/server/graphqlBff";
import { SurveyResponseFragment } from "~/responses/fragments";
import { getFragmentName } from "~/core/server/graphqlUtils";
import { fetchEditionMetadataSurveyForm } from "@devographics/fetch";
import { initRedis } from "@devographics/redis";
import { connectToRedis } from "~/lib/server/redis";
import { userFromReq } from "~/lib/server/context/userContext";
import { EditionMetadata, SurveyStatusEnum } from "@devographics/types";
// import { userFromReq } from "~/lib/server/context/userContext";

export default async function saveSurveyResponseHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // method
  if (req.method !== "POST") {
    return res.status(405).send({});
  }
  // db connections
  connectToRedis();
  // authenticated route
  const user = await userFromReq(req);
  if (!user) {
    // TODO: check also ownership of the response
    // (currently the graphql resolver also checks permissions, but it should progressively be done here)
    return res.status(401).send({ error: "Not authenticated" });
  }
  // parameters
  // TODO: we have already created an helper for this part to prepare migration to Next 13 route handlers
  const surveyId = req.query["surveyId"] as string;
  if (!surveyId) {
    return res.status(400).send({ error: "No survey id, can't start survey" });
  }
  const editionId = req.query["editionId"] as string;
  if (!editionId) {
    return res
      .status(400)
      .send({ error: "No survey edition id, can't start survey" });
  }
  let edition: EditionMetadata;
  try {
    edition = await fetchEditionMetadataSurveyForm({
      surveyId,
      editionId,
      calledFrom: "saveSurveyResponseHandler",
    });
  } catch (err) {
    console.error();
    return res.status(404).send({
      error: `No survey found, surveyId: '${surveyId}', editionId: '${editionId}'`,
    });
  }
  if (!edition.status || [SurveyStatusEnum.CLOSED].includes(edition.status)) {
    return res
      .status(400)
      .send({ error: `Survey '${editionId}' is not in open or preview mode.` });
  }

  // TODO: this code used to be a client-side graphql query
  // we reuse the same call temporarily to facilitate moving out of graphql
  try {
    const fragment = SurveyResponseFragment(edition);
    const fragmentName = getFragmentName(fragment);
    const mutation = gql`
              mutation saveSurvey($input: UpdateResponseInput) {
                saveSurvey(input: $input) {
                  data {
                    ...${fragmentName}
                  }
                }
              }
              ${fragment}
        `;

    // TODO: this hack let's us call the existing graphql API until we rewrite the server without graphql
    const headers = gqlHeaders(req);
    const body = JSON.stringify({
      query: print(mutation),
      variables: {
        input: req.body,
      },
    });
    const url = serverConfig().appUrl + "/api/graphql";
    const gqlRes = await fetch(url, {
      method: "POST",
      // @ts-ignore
      headers,
      body,
    });
    if (!gqlRes.ok) {
      console.error("Response text:", await gqlRes.text());
      return res.status(500).send({ error: "Error during saveSurvey" });
    }
    const gqlJson: {
      data?: any;
      // graphql errors
      errors?: Array<{
        /**
         * For graphql errors in Vulcan, it is a stringified JSON object containing multiple errors
         *@example [{"id":"app.validation_error","data":{"break":true,"errors":[{"break":true,"id":"error.duplicate_response","message":"Sorry, you already have a session in progress for this survey.","properties":{"responseId":"b_t8obuBh-z2ZvN6XiQH6"}}]}}]
         * TODO: can it contain multiple errors?
         */
        message: string;
        path: Array<string>;
        extensions: any;
        locations: Array<{ column: number; line: number }>;
      }>;
    } = await gqlRes.json();
    console.log("saveSurvey result", gqlJson);
    return res.status(200).json(gqlJson);
  } catch (err) {
    console.error("GraphQL fetch error", err);
    return res.status(500);
  }
}
