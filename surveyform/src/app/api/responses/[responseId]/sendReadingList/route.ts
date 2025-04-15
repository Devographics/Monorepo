import { NextRequest, NextResponse } from "next/server";
import { handlerMustHaveCurrentUser } from "~/lib/users/route-handlers/getters";
import { RouteHandlerOptions } from "~/app/api/typings";
import { HandlerError } from "~/lib/handler-error";
import { fetchEditionMetadata } from "@devographics/fetch";
import { localMailTransport } from "~/lib/server/mail/transports";
import { getReadingListEmail } from "./generateReadingListEmail";
import { loadResponse } from "~/lib/responses/db-actions/load";

export async function POST(req: NextRequest, props: RouteHandlerOptions<{ responseId: string }>) {
  const params = await props.params;
  try {
    const currentUser = await handlerMustHaveCurrentUser(req);

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

    const { email, surveyId, editionId } = clientData;

    const { data: edition } = await fetchEditionMetadata({
      surveyId,
      editionId,
      calledFrom: "sendReadingList",
    });
    const survey = edition.survey;

    const response = await loadResponse({ responseId, currentUser });

    const { subject, text, html, readingList, entities } =
      await getReadingListEmail({
        response,
        edition,
      });

    const from =
      survey.domain && `${survey.name} <hello@mail.devographics.com>`;

    const emailObject = {
      from,
      to: email,
      subject,
      text,
      html,
      readingList,
      entities,
    };

    // console.log("---------------------------------------------");
    // console.log(text);
    // console.log("---------------------------------------------");
    // console.log(html);
    // console.log("---------------------------------------------");

    const res = await localMailTransport.sendMail(emailObject);
    console.log("Sent a reading list to", email);

    return NextResponse.json({ data: { emailObject } });
  } catch (error) {
    console.log(error);
    if (error instanceof HandlerError) {
      return await error.toNextResponse(req);
    } else {
      return NextResponse.json(
        { error: `Could not send reading list` },
        { status: 500 }
      );
    }
  }
}
