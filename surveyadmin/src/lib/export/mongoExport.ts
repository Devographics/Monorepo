import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
const fsPromises = fs.promises;
import path from "path";
import { generateExportsZip } from "./generateExports";
import { fetchEditionMetadataAdmin } from "../api/fetch";
import { ExportOptions } from "./typings";

export async function mongoExportMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // We log exports so they never go unnoticed
  console.log(`Started an export with options ${JSON.stringify(req.query)}`);
  // parse options
  const surveyId = req.query["surveyId"];
  const editionId = req.query["editionId"];

  if (!(editionId && surveyId) || typeof editionId !== "string" || typeof surveyId !== "string") {
    return res
      .status(400)
      .send(
        `Expected string surveyId and editionId, got surveyId=${surveyId} editionId=${editionId}`
      );
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
    return res.status(500).send("Error while getting edition metadata: " + editionRes.error)
  }
  const edition = editionRes.data

  if (!edition) {
    return res
      .status(400)
      .send(`Survey with slug ${editionId} not found, cannot export.`);
  }

  // TODO: allow CSV https://www.mongodb.com/docs/database-tools/mongoexport/#export-in-csv-format
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
}
