import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
const fsPromises = fs.promises;
import path from "path";
import { getSurveyBySlug } from "~/modules/surveys/helpers";
import { ExportOptions } from "~/admin/models/export";
import { generateExportsZip } from "./generateExports";

export async function mongoExportMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // We log exports so they never go unnoticed
  console.log(`Started an export with options ${JSON.stringify(req.query)}`);
  // parse options
  const surveySlug = req.query["surveySlug"];
  if (typeof surveySlug !== "string") {
    return res
      .status(400)
      .send(
        "Survey slug must be defined and must be a string, got:" + surveySlug
      );
  }
  const options: ExportOptions = {
    surveySlug,
    format: {
      json: true,
    },
  };
  // find the survey
  const survey = getSurveyBySlug(surveySlug);
  if (!survey) {
    return res
      .status(400)
      .send(`Survey with slug ${surveySlug} not found, cannot export.`);
  }

  // TODO: allow CSV https://www.mongodb.com/docs/database-tools/mongoexport/#export-in-csv-format
  try {
    const zipFilePath = await generateExportsZip(survey);
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
