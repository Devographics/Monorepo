import { connectToRedis } from "~/lib/server/redis";
import { getRawResponsesCollection } from "@devographics/mongo";
import { Actions } from "~/lib/validation";
import { fetchEditionMetadata } from "@devographics/fetch";
import { EditionMetadata, SectionMetadata } from "@devographics/types";
import { getResponseSchema } from "~/lib/responses/schema";
import { restoreTypes, runFieldCallbacks, OnCreateProps } from "~/lib/schemas";
import type { PrefilledResponse, ResponseDocument } from "@devographics/types";
import { HandlerError } from "~/lib/handler-error";
import { validateResponse } from "./validate";
import shuffle from "lodash/shuffle.js";

export const duplicateResponseErrorId = "duplicate_response";

function shuffleSections(sections: SectionMetadata[]): SectionMetadata[] {
  const randomizedSections = sections.filter(
    (section) => section.randomizeSectionSequence === true,
  );
  const shuffled = shuffle(randomizedSections);

  let shuffledIndex = 0;
  return sections.map((item) =>
    item.randomizeSectionSequence ? shuffled[shuffledIndex++] : item,
  );
}

export async function createResponse({
  currentUser,
  clientData,
}: {
  currentUser: any;
  clientData: PrefilledResponse;
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

  // add custom section sequence if needed
  const randomizedSections = edition.sections.filter(
    (s) => s.randomizeSectionSequence === true,
  );
  if (randomizedSections.length > 0) {
    const shuffledSections = shuffleSections(edition.sections);
    serverData.sectionSequence = shuffledSections.map((section) => section.id);
  }

  // insert
  const insertRes = await RawResponse.insertOne(serverData);

  return serverData;
}
