import { NextRequest, NextResponse } from "next/server";
import { connectToRedis } from "~/lib/server/redis";
import { tryGetCurrentUser } from "../../currentUser/getters";
import { getRawResponsesCollection, newMongoId } from "@devographics/mongo";
import {
  validateResponse,
  Actions,
  ServerError,
  ServerErrorObject,
} from "~/lib/validation";
import { fetchEditionMetadataSurveyForm } from "@devographics/fetch";
import { EditionMetadata } from "@devographics/types";
import { getResponseSchema } from "~/lib/responses/schema";
import { restoreTypes, runFieldCallbacks, OnCreateProps } from "~/lib/schemas";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    if (!process.env.ENABLE_ROUTE_HANDLERS) {
      throw new ServerError({
        id: "route_handlers",
        message: "work in progress route handlers",
        status: 400,
      });
    }
    connectToRedis();

    // Get current user
    const currentUser = await tryGetCurrentUser(req);

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

    const { surveyId, editionId } = clientData;

    // check for existing response
    const RawResponse = await getRawResponsesCollection();
    const currentResponse = await RawResponse.findOne({
      userId: currentUser._id,
      editionId,
    });
    if (currentResponse) {
      throw new ServerError({
        id: "response_exists",
        message: `You already started to answer the ${editionId} survey`,
        status: 400,
      });
    }

    // Get edition metadata
    let edition: EditionMetadata;
    try {
      edition = await fetchEditionMetadataSurveyForm({
        surveyId,
        editionId,
        calledFrom: "api/response/create",
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
    return NextResponse.json({ data: serverData });
  } catch (error) {
    if (error instanceof ServerError) {
      const error_ = error as ServerErrorObject;
      return NextResponse.json({ error: error_ }, { status: error_.status });
    } else {
      return NextResponse.json(
        { error: `Could not create response` },
        { status: 500 }
      );
    }
  }
}
