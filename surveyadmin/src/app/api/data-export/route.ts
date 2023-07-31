import { NextRequest, NextResponse } from "next/server";
const fsPromises = fs.promises;
import path from "path";
import { generateExportsZip } from "~/lib/export/generateExports";
import { ExportOptions } from "~/lib/export/typings";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import fs from "fs"
import { streamFile } from "~/lib/export/fileStreaming";



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

    // TODO: options not yet used
    const options: ExportOptions = {
        editionId,
        surveyId,
        format: {
            json: true,
        },
    };

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

    // TODO: allow CSV https://www.mongodb.com/docs/database-tools/mongoexport/#export-in-csv-format
    try {
        const zipFilePath = await generateExportsZip(edition);
        // Now stream the file
        const stats = await fsPromises.stat(zipFilePath);
        console.log("File size: ", stats.size)
        const data: ReadableStream = streamFile(zipFilePath)
        const res = new NextResponse(data, {
            status: 200,
            headers: new Headers({
                "content-disposition": `attachment; filename=${path.basename(
                    zipFilePath
                )}`,
                "content-type": "application/zip",
                "content-length": stats.size + "",
            })
        })
        return res
    } catch (err) {
        return NextResponse.json({
            error:
                "Error while serving the file: " + err.message
        }, { status: 500 })
    }
}