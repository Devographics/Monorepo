import { exec } from "child_process";
import path from "path";
import { serverConfig } from "~/config/server";
import type { EditionMetadata } from "@devographics/types";

type SupportedFormat = "json" | "csv";

async function execAsPromise(cmd: string) {
  await new Promise<void>(function (resolve, reject) {
    exec(cmd, (error, stdout, stderr) => {
      console.debug(error, stdout, stderr);
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

const baseFields = [
  // "responseId" = the _id of the underlying response is very important
  // we will use this field to reconcile normalizedResponse and imported data
  // rather than the normalizedResponse _id which is more volatile
  "responseId",
  // normalizedResponse _id is less useful than responseId 
  // but is guaranteed to be unique
  "_id",
  "createdAt",
  "updatedAt",
  "isFinished",
  "survey",
  "year",
  "surveySlug",
  "generatedAt",
  // now in user_info (2023/09)
  "completion",
];
// TODO: are they up to date? can we get them from the outline?
const userNestedFields = [
  // if field change, add the new fields 
  //rather than changing the existing ones
  // to keep retro-compatibility
  // NOTE: we handle user info manually to avoid risk of leaking email etc.
  "user_info.age",
  "user_info.years_of_experience",
  "user_info.company_size",
  "user_info.yearly_salary",
  "user_info.higher_education_degree",
  "user_info.country",
  // in new surveys (2023/09) JPN instead of japan
  "user_info.country_alpha3",
  "user_info.gender",
  "user_info.race_ethnicity",
  "user_info.disability_status",
  "user_info.completion",
];
/**
 *
 * @param edition
 * @param flat Set to true to unwind the fields 
 * (useful for table format exports, like CSV).
 * Keep to false for JSON export.
 * @returns
 */
function extractSurveyFields(edition: EditionMetadata, flat?: boolean) {
  const userInfoFields = !flat ? ["user_info"] : userNestedFields;
  let surveyOutlineFields: Array<string>;
  // Currently, a field path is "outlineId.questionId" (or slug). Sections are
  // not taken into account
  if (!flat) {
    surveyOutlineFields =
      edition?.sections?.map((section) => section.slug || section.id) || [];
  } else {
    let surveyOutlineNestedFields: Array<string> = [];
    edition?.sections?.forEach((section) => {
      const sectionId = section.slug || section.id;

      // skip user_info: we handle user info manually to avoid risk of leaking email etc.
      if (sectionId === "user_info") return;

      section.questions.forEach((question) => {
        if (Array.isArray(question)) return;
        const questionId = question.id;
        surveyOutlineNestedFields.push(`${sectionId}.${questionId}`);
      });
    });
    surveyOutlineFields = surveyOutlineNestedFields;
  }
  const allFields = [
    ...new Set([
      ...baseFields,
      ...userInfoFields,
      ...surveyOutlineFields,
    ]).values(),
  ];
  return allFields;
}

/**
 * Exports the normalized responses
 * Fields are automatically obtained by parsing the edition definition
 * Documents are filtered via their "editionId" 
 * @returns 
 */
function mongoExportCmd({
  filePath,
  edition,
  format,
  normalizedResponsesCollectionName = "normalized_responses"
}: {
  filePath: string;
  edition: EditionMetadata;
  format: SupportedFormat;
  normalizedResponsesCollectionName?: string
}) {
  const editionId = edition.id!;
  /**
   * query: let's you filter with a custom query
   * fields: what fields will be included in the export
   * TODO: fields are probably not correct
   * NOTE: if the db is already in the mongoUri, no need to add the --db parameter
   * --db production \
   */
  const baseCmd = `
 mongoexport\
 --uri ${serverConfig().publicMongoUri}\
 --collection ${normalizedResponsesCollectionName} \
 --pretty\
 --query='{"editionId": "${editionId}"}' \
 --out=${filePath}\
      `;

  switch (format) {
    case "json": {
      // NOTE: fields are mandatory only for CSV but it's probably cleaner to explicitely list them, in particular to avoid
      // leaks if we inavertendly add a field in the db
      const surveyFields = extractSurveyFields(edition);
      // Fields seems to be defined by each "outline.id.slug" possible value + common fields like timestamps, and user_info
      // NOTE: in CSV export nested JSON objects stay nested, not sure how to improve that
      const fieldsArg = `--fields=${surveyFields.join(",")}`;
      /**
       * jsonArray: exports as a single big array (otherwise it creates an invalid JSON file)
       *
       */
      const jsonCmd = `${baseCmd} ${fieldsArg} --jsonArray --type=json`;
      return jsonCmd;
    }
    case "csv": {
      const surveyFields = extractSurveyFields(edition, true);
      // Fields seems to be defined by each "outline.id.slug" possible value + common fields like timestamps, and user_info
      // NOTE: in CSV export nested JSON objects stay nested, not sure how to improve that
      const fieldsArg = `--fields=${surveyFields.join(",")}`;
      const csvCmd = `${baseCmd} ${fieldsArg} --type=csv`;
      return csvCmd;
    }
    default: {
      throw new Error(`Unknown format ${format}`);
    }
  }
}

function getFileName(editionId: string, extension: string, timestamp: string,) {
  return `${editionId}${"_" + timestamp}.${extension}`;
}

function makeTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const timestamp = `${year}-${month}-${day}`;
  return timestamp
}

/**
 * @returns The full path, and a timestamp to be able to compute the path again
 */
export function getFilePath(
  editionId: string,
  extension: string,
  timestamp: string,
) {
  const fileName = getFileName(editionId, extension, timestamp)
  return path.resolve("/tmp", fileName)
}

/**
 * @returns The generate file path on disk
 */
async function generateMongoExport({
  format,
  edition,
  timestamp
}: {
  format: SupportedFormat;
  edition: EditionMetadata;
  timestamp: string
}): Promise<string> {
  const editionId = edition.id!;
  // run the export

  let filePath;
  switch (format) {
    case "json": {
      filePath = getFilePath(editionId, "json", timestamp);
      break;
    }
    case "csv": {
      filePath = getFilePath(editionId, "csv", timestamp);
      break;
    }
    default: {
      throw new Error(`Unknown format ${format}`);
    }
  }

  // DON'T LOG THIS COMMAND, it contains db auth info!
  const cmd = mongoExportCmd({
    filePath,
    edition,
    format,
  });
  console.log(
    "Start running mongo export with command:",
    cmd.replace(/\/\/(.*?)@/, "//username:password@")
  );
  await execAsPromise(cmd);
  console.log("Export successfully created", filePath);
  return filePath;
}

/**
 * @returns Files + a timestamp that can be passed to the frontend to later retrieve the files
 */
export async function generateExports(edition: EditionMetadata): Promise<{
  // All those values can be exposed to the frontend
  csvFilePath: string,
  jsonFilePath: string,
  /**
   * Acs as a unique id to retrieve an export
   */
  timestamp: string,
}> {
  const timestamp = makeTimestamp()
  const jsonFilePath = await generateMongoExport({
    format: "json",
    edition,
    timestamp
  });
  const csvFilePath = await generateMongoExport({
    format: "csv",
    edition,
    timestamp
  });
  return { jsonFilePath, csvFilePath, timestamp }
}


/**
 * 
 * @param edition 
 * @param filePaths 
 * @param timestamp 
 * @returns 
 */
export async function zipExports(edition: EditionMetadata, filePaths: Array<string>, timestamp: string) {
  const zipFilePath = getFilePath(edition.id, "zip", timestamp);
  const zipCmd = `zip ${zipFilePath} ${filePaths.join(" ")}`;
  await execAsPromise(zipCmd);
  // Now zipFilePath should exist
  return zipFilePath;
}
