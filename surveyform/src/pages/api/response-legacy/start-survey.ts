import gql from "graphql-tag";
import { getFragmentName } from "@vulcanjs/graphql";
import { CreateResponseOutputFragment } from "~/responses/fragments";
import type { NextApiRequest, NextApiResponse } from "next";

import { serverConfig } from "~/config/server";
import { print } from "graphql";
import { fetchEditionMetadataSurveyForm } from "@devographics/fetch";
import { connectToRedis } from "~/lib/server/redis";
import { userFromReq } from "~/lib/server/context/userContext";
import {
  SurveyEdition,
  SURVEY_OPEN,
  SURVEY_PREVIEW,
} from "@devographics/core-models";
import { EditionMetadata, SurveyStatusEnum } from "@devographics/types";
// TODO: skip the graphql part by calling the mutator directly
// import {createMutator} from "@devographics/crud/server"

export default async function responseStartSurveyHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405);
  }
  // await connectToAppDb();
  connectToRedis();
  // TODO: we have created an helper for this part to prepare migration to Next 13 route handlers
  const user = await userFromReq(req);
  if (!user) {
    return res.status(401).send({ error: "Not authenticated" });
  }
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
      calledFrom: "responseStartSurveyHandler",
    });
  } catch (err) {
    console.error();
    return res.status(404).send({
      error: `No survey found, surveyId: '${surveyId}', editionId: '${editionId}'`,
    });
  }
  if (!edition.status || [SurveyStatusEnum.CLOSED].includes(edition.status)) {
    return res.status(400).send({ error: `Survey '${editionId}' is closed.` });
  }

  // TODO: this code used to be a client-side graphql query
  // we reuse the same call temporarily to facilitate moving out of graphql
  try {
    const surveyCreateResponseOutputFragment =
      CreateResponseOutputFragment(edition);
    const mutation = gql`
            mutation startSurvey($input: CreateResponseInput) {
              startSurvey(input: $input) {
                ...${getFragmentName(surveyCreateResponseOutputFragment)}
              }
            }
            ${surveyCreateResponseOutputFragment}
        `;
    // TODO: this hack let's us call the existing graphql API until we rewrite the server without graphql
    const headers = {
      ...req.headers,
      "content-type": "application/json",
    };
    delete headers.connection;
    delete headers["content-length"];
    delete headers["transfer-encoding"];

    const gqlRes = await fetch(serverConfig().appUrl + "/api/graphql", {
      method: "POST",
      // @ts-ignore
      headers,
      body: JSON.stringify({
        query: print(mutation),
        variables: {
          input: {
            data: req.body,
          },
        },
      }),
    });
    if (!gqlRes.ok) {
      console.error("Response text:", await gqlRes.text());
      return res.status(500).send("Error during startSurvey");
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
    console.log("startSurvey result", JSON.stringify(gqlJson));
    return res.status(200).json({
      ...gqlJson,
      data: gqlJson.data?.startSurvey?.data
    });
  } catch (err) {
    console.error("GraphQL fetch error", err);
    return res.status(500);
  }
}
