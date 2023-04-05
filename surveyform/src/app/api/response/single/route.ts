import { ResponseDocument } from "@devographics/core-models";
import { ProjectionFields } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { UserMongooseModel } from "~/core/models/user.server";
import { connectToAppDb } from "~/lib/server/mongoose/connection";
import { connectToRedis } from "~/lib/server/redis";
import { ResponseMongooseModel } from "~/responses/model.server";
import { getUserIdFromReq } from "../getters";

// TODO: filter based on user permission,
// we probably have some logic for this in Vulcan
function asProject<T>(fields: Array<keyof T>): ProjectionFields<T> {
    return fields.reduce((p, f) => ({
        ...p, [f]: 1
    }), {})
}

export async function GET(req: NextRequest, res: NextResponse) {
    await connectToAppDb()
    connectToRedis()
    // TODO: existing endpoint was only getting the editionId 
    // => it's unable to get the whole response this way, why it works this way?
    // if adding "surveyId", use the already existing "getters" to get the survey
    const editionId = req.nextUrl.searchParams.get("editionId")
    if (!editionId) {
        return NextResponse.json({ error: "Missing editionId" }, { status: 400 })
    }
    const userId = await getUserIdFromReq(req)
    if (!userId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const currentUser = await UserMongooseModel.findById(userId, {
        username: 1,
        createdAt: 1,
        isAdmin: 1,
        groups: 1,
    })
    if (!currentUser) {
        return NextResponse.json({ error: "User do not exist anymore" }, { status: 401 })
    }
    //console.log("user", currentUser)
    const resProj = asProject<ResponseDocument>([
        "pagePath",
        "editionId",
        "completion",
        "createdAt",
        // TODO: survey? it's resolved via endpoint,
        // we should get it from editionId (+ add surveyId param) instead
    ])
    // TODO: we have to init the "response" model
    const userResponse = await ResponseMongooseModel().findOne({
        userId,
        editionId
    }, {
    })
    //console.log("responses", userResponse)
    // TODO: shape similary as the previous graphql response
    // then improve (need frontend update)
    return NextResponse.json({ error: "NOT YET IMPLEMENTED" }, { status: 500 })
}