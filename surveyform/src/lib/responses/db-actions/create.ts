import { connectToRedis } from "~/lib/server/redis";
import { getRawResponsesCollection } from "@devographics/mongo";
import { Actions } from "~/lib/validation";
import { fetchEditionMetadata } from "@devographics/fetch";
import { EditionMetadata } from "@devographics/types";
import { getResponseSchema } from "~/lib/responses/schema";
import { restoreTypes, runFieldCallbacks, OnCreateProps } from "~/lib/schemas";
import type { ResponseDocument } from "@devographics/types";
import { HandlerError } from "~/lib/handler-error";
import { validateResponse } from "./validate";

export const duplicateResponseErrorId = "duplicate_response";

export async function createResponse({
  currentUser,
  clientData,
}: {
  currentUser: any;
  clientData: ResponseDocument;
}) {
  connectToRedis();

  const { surveyId, editionId } = clientData;
  if (!surveyId || !editionId) {
    throw new HandlerError({
      id: "missing_surveyid_editionid",
      message: "Missing surveyId or editionId",
      status: 400,
    });
  }

  // check for existing response
  const RawResponse = await getRawResponsesCollection();
  const currentResponse = await RawResponse.findOne({
    userId: currentUser._id,
    editionId,
  });
  if (currentResponse) {
    throw new HandlerError({
      id: duplicateResponseErrorId,
      message: `You already started to answer the ${editionId} survey`,
      status: 400,
      properties: { responseId: currentResponse._id },
    });
  }

  // Get edition metadata
  let edition: EditionMetadata;
  try {
    edition = (
      await fetchEditionMetadata({
        surveyId,
        editionId,
        calledFrom: "api/response/create",
      })
    ).data;
  } catch (error) {
    throw new HandlerError({
      id: "fetch_edition",
      message: `Could not load edition metadata for surveyId: '${surveyId}', editionId: '${editionId}'`,
      status: 400,
      error,
    });
  }
  const survey = edition.survey;

  const schema = getResponseSchema({ survey, edition });

  clientData = restoreTypes({
    document: clientData,
    schema,
  });

  const props = {
    currentUser,
    clientData,
    survey: edition.survey,
    edition,
    action: Actions.CREATE,
  };

  // add server-defined properties
  const serverData = await runFieldCallbacks<OnCreateProps>({
    document: clientData,
    schema,
    action: Actions.CREATE,
    props,
  });

  // validate response
  validateResponse({ ...props, serverData });

  // insert
  const insertRes = await RawResponse.insertOne(serverData);

  return serverData;
}
