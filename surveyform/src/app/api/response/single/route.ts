// TODO: this route may be removed if we load the response in RSC
// but we need the same logic anyway
import { getGroups } from "@devographics/permissions";
import { NextRequest, NextResponse } from "next/server";
import { UserDocument } from "~/core/models/user";
// import { UserMongooseModel } from "~/core/models/user.server";
// import { connectToAppDb } from "~/lib/server/mongoose/connection";
import { connectToRedis } from "~/lib/server/redis";
// import { ResponseMongooseModel } from "~/responses/model.server";
import { tryGetEditionFromReq, getUserIdFromReq } from "../getters";
import { responseRestrictedFields } from "~/responses/server/shema";
import {
  getRawResponsesCollection,
  getUsersCollection,
} from "@devographics/mongo";
import omit from "lodash/omit";

// TODO: filter based on user permission,
// we probably have some logic for this in Vulcan
// function asProjection<T>(fields: Array<keyof T>): ProjectionFields<T> {
//   return fields.reduce(
//     (p, f) => ({
//       ...p,
//       [f]: 1,
//     }),
//     {}
//   );
// }

// TODO: take current user into account
// we probably have some logic for this in Vulcan
// function restrict<T>(doc: T, fields: Array<keyof T>): any {
//   return fields.reduce(
//     (d, f) => ({
//       ...d,
//       [f]: doc[f],
//     }),
//     {}
//   );
// }

export async function GET(req: NextRequest, res: NextResponse) {
  // await connectToAppDb();
  connectToRedis();
  const editionOrRes = await tryGetEditionFromReq(req);
  if (editionOrRes instanceof Response) {
    console.log("res");
    return editionOrRes;
  }
  const edition = editionOrRes

  const userId = await getUserIdFromReq(req);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const Users = await getUsersCollection();
  const currentUser = await Users.findOne<UserDocument>(
    { _id: userId },
    { projection: { isAdmin: true, createdAt: true } }
  );
  if (!currentUser) {
    return NextResponse.json(
      { error: "User do not exist anymore" },
      { status: 401 }
    );
  }

  // get response with relevant fields
  // const responseProjection = asProjection<ResponseDocument>([
  //   "pagePath",
  //   "editionId",
  //   "completion",
  //   "createdAt",
  // ]);
  const selector = {
    userId,
    editionId: edition.id,
  };

  const RawResponses = await getRawResponsesCollection();
  const responseFromDb = await RawResponses.findOne(selector);
  // const responseFromDb =
  //   await ResponseMongooseModel().findOne<ResponseDocument>(
  //     selector,
  //     responseProjection
  //   );
  if (!responseFromDb) {
    return NextResponse.json(null);
  }
  // fill currentUser groups
  currentUser.groups = getGroups(currentUser, responseFromDb);
  // remove fields that user cannot read
  const response = omit(responseFromDb, responseRestrictedFields);

  return NextResponse.json(response);
}
