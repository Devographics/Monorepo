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

  return NextResponse.json({
    error:
      "NOT YET IMPLEMENTED"
  }, { status: 500 })
  /*
  TODO: convert to Next 13 response
  try {
    const zipFilePath = await generateExportsZip(edition);
    // Now stream the file
    const stats = await fsPromises.stat(zipFilePath);
    res.writeHead(200, {
      "Content-Disposition": `attachment; filename=${path.basename(
        zipFilePath
      )}`,
      "Content-Type": "application/zip",
      "Content-Length": stats.size,
    });
    await new Promise(function (resolve) {
      console.log("Open read stream");
      const downloadStream = fs.createReadStream(zipFilePath);
      downloadStream.pipe(res);
      downloadStream.on("end", resolve);
    });
    console.log("done");
    return res;
  } catch (err) {
    console.error("error", err);
    return res.status(500).end(err.message);
  }
  */
  // TODO: allow CSV https://www.mongodb.com/docs/database-tools/mongoexport/#export-in-csv-format
}
