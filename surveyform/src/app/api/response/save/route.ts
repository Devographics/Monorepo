import { NextRequest, NextResponse } from "next/server";
import { connectToRedis } from "~/lib/server/redis";
import { tryGetCurrentUser } from "../getters";
import { getRawResponsesCollection, newMongoId } from "@devographics/mongo";
import {
  validateResponse,
  Actions,
  ServerError,
  ServerErrorObject,
} from "~/lib/validation";
import { fetchEditionMetadataSurveyForm } from "@devographics/fetch";
import { EditionMetadata } from "@devographics/types";
import { getResponseSchema } from "~/lib/responses";
import { restoreTypes } from "~/lib/schemas";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    if (!process.env.ENABLE_ROUTE_HANDLERS) {
      throw new ServerError({
        id: "route_handlers_error",
        message: "work in progress route handlers",
        status: 400,
      });
    }
    connectToRedis();

    // Get current user
    const currentUser = await tryGetCurrentUser(req);

    // Get responseId
    const responseId = req.nextUrl.searchParams.get("responseId");
    if (!responseId) {
      throw new ServerError({
        id: "missing_response_id",
        message: "Could not find responseId",
        status: 400,
      });
    }

    // Get body data as JSON
    let clientData: any;
    try {
      clientData = await req.json();
      console.log("// clientData");
      console.log(clientData);
    } catch (err) {
      throw new ServerError({
        id: "invalid_data",
        message: "Found invalid data when parsing response data",
        status: 400,
      });
    }

    // Check for existing response
    const RawResponse = await getRawResponsesCollection();
    const existingResponse = await RawResponse.findOne({
      _id: responseId,
    });
    if (!existingResponse) {
      throw new ServerError({
        id: "response_doesnt_exists",
        message: `Could not find existing response with _id ${responseId}`,
        status: 400,
      });
    }

    const { surveyId, editionId } = existingResponse;

    // Get edition metadata
    let edition: EditionMetadata;
    try {
      edition = await fetchEditionMetadataSurveyForm({
        surveyId,
        editionId,
        calledFrom: "api/response/update",
      });
    } catch (error) {
      throw new ServerError({
        id: "fetch_edition",
        message: `Could not load edition metadata for surveyId: '${surveyId}', editionId: '${editionId}'`,
        status: 400,
        error,
      });
    }
    const survey = edition.survey;

    clientData = restoreTypes({
      document: clientData,
      schema: getResponseSchema({ survey, edition }),
    });

    // add server-defined properties
    const serverData = {
      ...clientData,
      updatedAt: new Date(),
    };

    // validate response
    validateResponse({
      user: currentUser,
      existingResponse,
      clientData,
      serverData,
      survey: edition.survey,
      edition,
      action: Actions.UPDATE,
    });

    // update
    const updateRes = await RawResponse.updateOne(
      { _id: responseId },
      {
        $set: { ...serverData },
      }
    );
    return NextResponse.json({ data: serverData });
  } catch (error) {
    if (error instanceof ServerError) {
      const error_ = error as ServerErrorObject;
      return NextResponse.json({ error: error_ }, { status: error_.status });
    } else {
      return NextResponse.json(
        { error: `Could not update response` },
        { status: 500 }
      );
    }
  }
}
