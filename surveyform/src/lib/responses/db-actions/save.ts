import { connectToRedis } from "~/lib/server/redis";
import { getRawResponsesCollection } from "@devographics/mongo";
import { Actions } from "~/lib/validation";
import { fetchEditionMetadata } from "~/lib/api/fetch";
import { EditionMetadata } from "@devographics/types";
import { getResponseSchema } from "~/lib/responses/schema";
import { restoreTypes, runFieldCallbacks, OnUpdateProps } from "~/lib/schemas";
import type { ResponseDocument } from "@devographics/types";
import { subscribe } from "~/lib/server/email/email_octopus";
import { captureException } from "@sentry/nextjs";
import { HandlerError } from "~/lib/handler-error";
import { validateResponse } from "./validate";
import { emailPlaceholder } from "~/lib/responses/schema";

export async function saveResponse({
  responseId,
  clientData,
  currentUser,
}: {
  responseId: string;
  clientData: ResponseDocument;
  currentUser: any;
}) {
  connectToRedis();

  // Check for existing response
  const RawResponse = await getRawResponsesCollection();
  const existingResponse = await RawResponse.findOne({
    _id: responseId,
  });
  if (!existingResponse) {
    throw new HandlerError({
      id: "response_doesnt_exists",
      message: `Could not find existing response with _id ${responseId}`,
      status: 400,
    });
  }

  const { surveyId, editionId } = existingResponse;

  // Get edition metadata
  let edition: EditionMetadata;
  try {
    edition = await fetchEditionMetadata({
      surveyId,
      editionId,
      calledFrom: "api/response/update",
    });
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

  // update existing response with new client data
  const updatedResponse = {
    ...existingResponse,
    ...clientData,
  };

  const props = {
    currentUser,
    existingResponse,
    updatedResponse,
    clientData,
    survey: edition.survey,
    edition,
    action: Actions.UPDATE,
  };

  // add server-defined properties
  const serverData = await runFieldCallbacks<OnUpdateProps>({
    document: clientData,
    schema,
    action: Actions.UPDATE,
    props,
  });

  // if user has entered their email, try to subscribe them to the email list
  const receiveNotifications = clientData.receiveNotifications;
  const email = clientData.email;

  if (receiveNotifications && email && email !== emailPlaceholder) {
    if (!existingResponse.isSubscribed) {
      const listId = survey?.emailOctopus?.listId;
      try {
        subscribe({ email, listId });
        serverData.isSubscribed = true;
      } catch (error) {
        // We do not hard fail on subscription error, just log to Sentry
        captureException(error);
        console.error(error);
      }
    }
    // replace email with placeholder value for privacy reasons
    serverData.email = emailPlaceholder;
  }

  // validate response
  validateResponse({ ...props, serverData });

  // update
  const updateRes = await RawResponse.updateOne(
    { _id: responseId },
    {
      $set: { ...serverData },
    }
  );
  return serverData;
}
