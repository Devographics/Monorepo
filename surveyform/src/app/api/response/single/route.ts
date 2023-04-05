import { ResponseDocument, SurveyEdition } from "@devographics/core-models";
import { ProjectionFields } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { UserDocument } from "~/core/models/user";
import { UserMongooseModel } from "~/core/models/user.server";
import { connectToAppDb } from "~/lib/server/mongoose/connection";
import { connectToRedis } from "~/lib/server/redis";
import { ResponseMongooseModel } from "~/responses/model.server";
import { getSurveyFromReq, getUserIdFromReq } from "../getters";

// TODO: filter based on user permission,
// we probably have some logic for this in Vulcan
function asProject<T>(fields: Array<keyof T>): ProjectionFields<T> {
    return fields.reduce((p, f) => ({
        ...p, [f]: 1
    }), {})
}

// TODO: take current user into account
// we probably have some logic for this in Vulcan
function restrict<T>(doc: T, fields: Array<keyof T>): any {
    return fields.reduce((d, f) => ({
        ...d,
        [f]: doc[f]
    }), {})
}

export async function GET(req: NextRequest, res: NextResponse) {
    await connectToAppDb()
    connectToRedis()
    // TODO: existing endpoint was only getting the editionId 
    // => it's unable to get the whole response this way, why it works this way?
    // if adding "surveyId", use the already existing "getters" to get the survey
    const surveyOrRes = await getSurveyFromReq(req)
    if (surveyOrRes instanceof Response) {
        console.log("res")
        return surveyOrRes
    }
    const survey = surveyOrRes

    const userId = await getUserIdFromReq(req)
    if (!userId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const currentUser = (await UserMongooseModel.findById<UserDocument>(userId, {
        username: 1,
        createdAt: 1,
        isAdmin: 1,
        // TODO: groups are populated by Vulcan logic
        // reenable this
        groups: 1,
    }))?.toObject()

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
    const userSurveyResponse = (await ResponseMongooseModel().findOne<ResponseDocument>({
        userId,
        editionId: survey.editionId
    }, {
    }))
    //console.log("responses", userResponse)
    // TODO: shape similary as the previous graphql response
    // then improve (need frontend update)
    const surveyResult = restrict<SurveyEdition>(surveyOrRes, ["slug", "surveyId", "editionId", "prettySlug", "name", "year", "domain", "status", "imageUrl", "faviconUrl", "socialImageUrl", "resultsUrl"])
    console.log({
        ...currentUser,
        responses: [{
            ...userSurveyResponse,
            survey: surveyResult
        }],
    })
    return NextResponse.json({ error: "NOT YET IMPLEMENTED" }, { status: 500 })
}