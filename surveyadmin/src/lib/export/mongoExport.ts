import fs from "fs";
const fsPromises = fs.promises;
import path from "path";
import { generateExportsZip } from "./generateExports";
import { fetchEditionMetadataAdmin } from "../api/fetch";
import { ExportOptions } from "./typings";
import { NextRequest, NextResponse } from "next/server";

export async function mongoExportMiddleware(
  req: NextRequest,
): Promise<NextResponse> {
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
    // this gets a fs "ReadStream" but we want a web platform "ReadableStream"
    //const downloadStream = fs.createReadStream(zipFilePath);
    // TODO: see https://github.com/vercel/next.js/discussions/15453#discussioncomment-6226391
    // and https://stackoverflow.com/questions/76763053/how-to-convert-readstream-into-readablestream-in-nodejs?noredirect=1#comment135330402_76763053
    const data = await fsPromises.readFile(zipFilePath)
    // TODO: doesn't work yet despite the file being correct
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
