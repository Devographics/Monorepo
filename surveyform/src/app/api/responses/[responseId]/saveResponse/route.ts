import { NextRequest, NextResponse } from "next/server";
import { handlerMustHaveCurrentUser } from "~/account/user/route-handlers/getters";
import { RouteHandlerOptions } from "~/app/api/typings";
import { loadResponse } from "~/lib/responses/db-actions/load";
import { saveResponse } from "~/lib/responses/db-actions/save";
import { HandlerError } from "~/lib/handler-error";
import { captureException } from "@sentry/nextjs";

export async function POST(
  req: NextRequest,
  { params }: RouteHandlerOptions<{ responseId: string }>
) {
  try {
    // Get current user
    const currentUser = await handlerMustHaveCurrentUser(req);

    // Get responseId
    // TODO: this should be a route parameter instead
    const responseId = params.responseId;
    if (!responseId) {
      throw new HandlerError({
        id: "missing_response_id",
        message: "Could not find responseId",
        status: 400,
      });
    }

    // Get body data as JSON
    let clientData: any;
    try {
      clientData = await req.json();
    } catch (err) {
      throw new HandlerError({
        id: "invalid_data",
        message: "Found invalid data when parsing response data",
        status: 400,
      });
    }

    await saveResponse({
      responseId,
      currentUser,
      clientData,
    });
    const updatedResponse = await loadResponse({ responseId, currentUser });
    if (!updatedResponse)
      throw new HandlerError({
        id: "response-not-found-after-update",
        message: "Couldn't find response after an update",
        status: 500,
      });
    // NOTE: it's important to return the updated data
    // because we do some client-side updates until issue below is fixed:
    // @see https://github.com/vercel/next.js/issues/49450
    return NextResponse.json({ data: updatedResponse });
  } catch (error) {
    if (error instanceof HandlerError) {
      return await error.toNextResponse(req);
    } else {
      console.error(error);
      captureException(error);
      return NextResponse.json(
        {
          error: {
            id: "unkown_error",
            status: 500,
            message: `Could not update response`,
            error,
          },
        },
        { status: 500 }
      );
    }
  }
}
