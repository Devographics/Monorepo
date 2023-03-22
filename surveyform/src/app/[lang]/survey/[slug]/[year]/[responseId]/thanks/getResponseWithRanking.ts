import { getSurveyResponseModel } from "~/responses/model.client";
import { ResponseFragmentWithRanking } from "~/responses/fragments";
import { buildSingleQuery } from "@devographics/crud";

import { ResponseDocument, SurveyEdition } from "@devographics/core-models";
import { print } from "graphql";
import { serverConfig } from "~/config/server";

export async function getResponseWithRanking({
    responseId,
    survey,
}: {
    survey: SurveyEdition;
    responseId: string;
}) {
    // TODO: get from the database directly, the graphql call is just for convenience
    const query = buildSingleQuery({
        // @ts-ignore
        model: getSurveyResponseModel(survey),
        fragment: survey && ResponseFragmentWithRanking(survey),
    });
    try {
        // TODO: this hack let's us call the existing graphql API until we rewrite the server without graphql
        const headers = {
            //...req.headers,
            "content-type": "application/json",
        };
        //delete headers.connection
        const gqlRes = await fetch(serverConfig().appUrl + "/api/graphql", {
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