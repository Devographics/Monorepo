import { NextRequest, NextResponse } from "next/server";
import { connectToRedis } from "~/lib/server/redis";
import { tryGetEditionFromReq, tryGetCurrentUser } from "../getters";
import { getRawResponsesCollection, newMongoId } from "@devographics/mongo";
import { validateResponse, Actions } from "~/lib/validation";

/**
 * TODO: reintroduce logic from src/responses/server/graphql/start_survey.ts
 * like the duplicateCheck, the onCreate logic, and permission checks
 */
export async function POST(req: NextRequest, res: NextResponse) {
  if (!process.env.ENABLE_ROUTE_HANDLERS)
    throw new Error("work in progress route handlers");
  connectToRedis();
  // current User
  const currentUserOrRes = await tryGetCurrentUser(req);
  if (currentUserOrRes instanceof Response) {
    return currentUserOrRes;
  }
  const currentUser = currentUserOrRes;

  // survey edition
  const editionOrRes = await tryGetEditionFromReq(req);
  if (editionOrRes instanceof Response) {
    console.log("res");
    return editionOrRes;
  }
  const edition = editionOrRes;

  // user shouldn't have a response
  // TODO: reuse duplicateCheck?
  const RawResponse = await getRawResponsesCollection();
  const currentResponse = await RawResponse.findOne({
    userId: currentUser._id,
    editionId: edition.id,
  });
  if (currentResponse) {
    return NextResponse.json(
      { error: `You already started to answer the ${edition.id} survey` },
      { status: 400 }
    );
  }

  // TODO: type the expected structure (a tool like )
  let clientData: any;
  try {
    // TODO: check this data structure!! omit fields user cannot create or update,
    // maybe add timestamps if the db doesn't add them already
    clientData = await req.json();
    console.log("// clientData");
    console.log(clientData);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Found invalid data when creating your response" },
      { status: 400 }
    );
  }

  const serverData = {
    ...clientData,
    // Important: generate string ids in Mongo
    _id: newMongoId(),
    // Important: allow to retrieve the response later on
    userId: currentUser._id,
  };

  validateResponse({
    user: currentUser,
    clientData,
    serverData,
    survey: edition.survey,
    edition,
    action: Actions.CREATE,
  });

  try {
    // const insertRes = await RawResponse.insertOne(data)
    // console.log('// insertRes')
    // console.log(insertRes)
    // // TODO: restrict field of this response
    // const insertedFromDb = await RawResponse.findOne({ _id: insertRes.insertedId })
    // if (insertedFromDb.userId !== currentUser._id) {
    //     throw new Error("Inserted response userId doesn't match current user id")
    // }
    // // TODO: omit fields user cannot read
    // const inserted = insertedFromDb // omit(insertedFromDb)
    return NextResponse.json({});
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not create a new response" },
      { status: 500 }
    );
  }
}
