// TODO: this route may be removed if we load the response in RSC
// but we need the same logic anyway
import { ResponseDocument, SurveyEdition } from "@devographics/core-models";
import { getGroups, restrictViewableFields } from "@devographics/permissions"
import { ProjectionFields } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { UserDocument } from "~/core/models/user";
import { UserMongooseModel } from "~/core/models/user.server";
import { connectToAppDb } from "~/lib/server/mongoose/connection";
import { connectToRedis } from "~/lib/server/redis";
import { ResponseMongooseModel } from "~/responses/model.server";
import { getSurveyFromReq, getUserIdFromReq } from "../getters";
import { responsePermissionSchema } from "~/responses/server/shema";

// TODO: filter based on user permission,
// we probably have some logic for this in Vulcan
function asProjection<T>(fields: Array<keyof T>): ProjectionFields<T> {
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

    // get response with relevant fields
    const responseProjection = asProjection<ResponseDocument>([
        "pagePath",
        "editionId",
        "completion",
        "createdAt",
    ])
    const responseFromDb = await ResponseMongooseModel().findOne<ResponseDocument>({
        userId,
        editionId: survey.editionId
    }, responseProjection)
    if (!responseFromDb) {
        return NextResponse.json(null)
    }
    // fill currentUser groups
    currentUser.groups = getGroups(currentUser, responseFromDb)
    // remove fields that user cannot read
    const response = restrictViewableFields(responsePermissionSchema, responseFromDb, currentUser)

    // TODO: this is probably unused/not necessary
    const surveyResult = restrict<SurveyEdition>(surveyOrRes, ["slug", "surveyId", "editionId", "prettySlug", "name", "year", "domain", "status", "imageUrl", "faviconUrl", "socialImageUrl", "resultsUrl"])

    return NextResponse.json({
        ...response,
        // TODO: this is useless, the frontend already know the survey when it fetches the response
        // check where it's used in the frontend and remove
        survey: surveyResult
    })
}