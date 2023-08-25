import { NextRequest, NextResponse } from "next/server";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { generateExports } from "~/lib/export/generateExports";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
    // We log exports so they never go unnoticed
    console.log(`Started an export`);
    // parse options
    const surveyId = req.nextUrl.searchParams.get("surveyId");
    const editionId = req.nextUrl.searchParams.get("editionId");

    if (!(editionId && surveyId) || typeof editionId !== "string" || typeof surveyId !== "string") {
        return NextResponse.json({
            error:
                `Expected string surveyId and editionId, got surveyId=${surveyId} editionId=${editionId}`
        }, { status: 400 })
    }
    // find the survey
    const editionRes = await fetchEditionMetadataAdmin({ editionId, surveyId })
    if (editionRes.error) {
        return NextResponse.json({
            error:
                "Error while getting edition metadata: " + editionRes.error
        }, { status: 500 })
    }
    const edition = editionRes.data

    if (!edition) {
        return NextResponse.json({
            error:
                `Survey with surveyId ${surveyId} and editionId ${editionId} not found, cannot export.`
        }, { status: 400 })
    }

    try {
        const { jsonFilePath, csvFilePath } = await generateExports(edition)
        return NextResponse.json({ jsonFilePath, csvFilePath })
    } catch (err) {
        return NextResponse.json({
            error:
                "Error while serving the file: " + err.message
        }, { status: 500 })
    }
}