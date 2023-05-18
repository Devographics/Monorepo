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
import { restoreTypes, runFieldCallbacks, OnUpdateProps } from "~/lib/schemas";

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
      action: Actions.CREATE,
      props,
    });

    // validate response
    validateResponse({ ...props, serverData });

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

// const emailPlaceholder = "*****@*****";
// const emailFieldName = "email_temporary";

// export async function processEmailOnUpdate(data, properties) {
//   const { document } = properties;
//   const { isSubscribed, surveyId, editionId } = document as ResponseDocument;

//   const surveys = await fetchSurveysMetadata();
//   const survey = surveys.find((s) => s.id === surveyId);
//   const listId = survey?.emailOctopus?.listId;
//   const emailFieldPath = `${editionId}__user_info__${emailFieldName}`;
//   const email = data[emailFieldPath];

//   // if user has entered their email
//   if (email && email !== emailPlaceholder) {
//     // try to subscribe them to the email list
//     if (!isSubscribed) {
//       try {
//         subscribe({ email, listId });
//       } catch (error) {
//         // We do not hard fail on subscription error, just log to Sentry
//         captureException(error);
//         console.error(error);
//       }
//       data["isSubscribed"] = true;
//     }

//     // Note: do this separately after all, and only if we get permission
//     // generate a hash and store it
//     // if (!emailHash) {
//     //   data["emailHash"] = createEmailHash(email);
//     // }

//     // replace the email with a dummy placeholder, effectively deleting it
//     data[emailFieldPath] = emailPlaceholder;
//   }
//   return data;
// }
