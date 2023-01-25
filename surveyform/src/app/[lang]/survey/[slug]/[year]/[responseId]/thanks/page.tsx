import Thanks from "~/core/components/pages/Thanks";
import { Response } from "~/responses";
import { ResponseFragmentWithRanking } from "~/responses/fragments";
import { serverConfig } from "~/config/server";
import { buildSingleQuery } from "@devographics/crud";
import React from "react";

import {
  ResponseDocument,
  SerializedSurveyDocument,
} from "@devographics/core-models";
import { print } from "graphql";
import { notFound } from "next/navigation";
import { fetchSurveyGithub } from "~/surveys/server/fetch";

async function getResponseWithRanking({
  responseId,
  survey,
}: {
  survey: SerializedSurveyDocument;
  responseId: string;
}) {
  // TODO: get from the database directly, the graphql call is just for convenience
  const query = buildSingleQuery({
    model: Response,
    fragment: survey && ResponseFragmentWithRanking(survey),
  });
  try {
    // TODO: this hack let's us call the existing graphql API until we rewrite the server without graphql
    const headers = {
      //...req.headers,
      "content-type": "application/json",
    };
    //delete headers.connection
    const gqlRes = await fetch(serverConfig.appUrl + "/api/graphql", {
      method: "POST",
      // @ts-ignore
      headers,
      // TODO: this query doesn't consider the survey slug
      body: JSON.stringify({
        query: print(query),
        variables: {
          input: { id: responseId },
        },
      }),
    });
    if (!gqlRes.ok) {
      console.error("Response text:", await gqlRes.text());
      throw new Error("Error during fetch");
    }
    const data = await gqlRes.json();
    console.log("GOT DATA FROM GRAPHQL CALL", data);
    // TODO: filter during call to db already
    const response: ResponseDocument = data?.data?.response;
    return response;
    //return res.status(200).json(surveyResponse);
  } catch (err) {
    console.error("GraphQL fetch error", err);
    throw err;
    //return res.status(500);
  }
}

const ThanksPage = async ({
  params: { responseId, slug, year },
}: {
  params: {
    responseId: string;
    slug: string;
    year: string;
  };
}) => {
  const readOnly = responseId === "read-only";
  // NOTE: Next.js 13 automatically deduplicate request
  // it's ok to fetch data again here after fetching in the layout
  const survey = await fetchSurveyGithub(slug, year);
  if (!survey) {
    notFound();
  }
  if (readOnly) {
    return <Thanks readOnly={readOnly} />;
  }
  const response = await getResponseWithRanking({ responseId, survey });
  return <Thanks response={response} />;
};

export default ThanksPage;
