import { NextRequest, NextResponse } from "next/server";
import { createResponse } from "~/lib/responses/db-actions/create";
import { HandlerError } from "~/lib/handler-error";
import { handlerMustHaveCurrentUser } from "~/lib/users/route-handlers/getters";
// import { captureException } from "@sentry/nextjs";

export async function POST(req: NextRequest) {
  try {
    // Get current user
    const currentUser = await handlerMustHaveCurrentUser(req);

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

    const data = await createResponse({ clientData, currentUser });
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    if (error instanceof HandlerError) {
      return await error.toNextResponse(req);
    } else {
      console.error(error);
      // captureException(error);
      return NextResponse.json(
        {
          error: {
            id: "response_create_error",
            status: 500,
            message: error.message,
            error,
          },
        },
        { status: 500 }
      );
    }
  }
}
