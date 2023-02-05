import { exec } from "child_process";
import path from "path";
import { serverConfig } from "~/config/server";
import type { SurveyEdition } from "@devographics/core-models";

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
  "_id",
  "createdAt",
  "updatedAt",
  "completion",
  "isFinished",
  "survey",
  "year",
  "surveySlug",
  "generatedAt",
];
const userNestedFields = [
  "user_info.age",
  "user_info.years_of_experience",
  "user_info.company_size",
  "user_info.yearly_salary",
  "user_info.higher_education_degree",
  "user_info.country",
  "user_info.gender",
  "user_info.race_ethnicity",
  "user_info.disability_status",
];
/**
 *
 * @param survey
 * @param flat Set to true to unwind the fields (useful for table format exports, like CSV).
 * Keep to false for JSON export.
 * @returns
 */
function extractSurveyFields(survey: SurveyEdition, flat?: boolean) {
  const userInfoFields = !flat ? ["user_info"] : userNestedFields;
  let surveyOutlineFields;
  // Currently, a field path is "outlineId.questionId" (or slug). Sections are
  // not taken into account
  if (!flat) {
    surveyOutlineFields = survey.outline.map(
      (outline) => outline.slug || outline.id
    );
  } else {
    let surveyOutlineNestedFields: Array<string> = [];
    survey.outline.forEach((outline) => {
      const outlineId = outline.slug || outline.id;

      // skip user_info: we handle user info manually to avoid risk of leaking email etc.
      if (outlineId === "user_info") return;

      outline.questions.forEach((question) => {
        if (Array.isArray(question)) return;
        const questionId = question.id;
        surveyOutlineNestedFields.push(`${outlineId}.${questionId}`);
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

function mongoExportCmd({
  filePath,
  survey,
  format,
}: {
  filePath: string;
  survey: SurveyEdition;
  format: SupportedFormat;
}) {
  const surveySlug = survey.slug!;
  /**
   * query: let's you filter with a custom query
   * fields: what fields will be included in the export
   * TODO: fields are probably not correct
   * NOTE: if the db is already in the mongoUri, no need to add the --db parameter
   * --db production \
   */
  const baseCmd = `
 mongoexport\
 --uri ${serverConfig.publicReadonlyMongoUri}\
 --collection normalized_responses \
 --pretty\
 --query='{"surveySlug": "${surveySlug}"}' \
 --out=${filePath}\
      `;

  switch (format) {
    case "json": {
      // NOTE: fields are mandatory only for CSV but it's probably cleaner to explicitely list them, in particular to avoid
      // leaks if we inavertendly add a field in the db
      const surveyFields = extractSurveyFields(survey);
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
      const surveyFields = extractSurveyFields(survey, true);
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

const makeFilePath = (
  surveySlug: string,
  extension: string,
  addTimestamp?: boolean
) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const timestamp = `${year}-${month}-${day}`;

  const filename = `${surveySlug}${addTimestamp ? "_" + timestamp : ""
    }.${extension}`;
  return path.resolve("/tmp", filename);
};

/**
 * @returns The generate file path on disk
 */
async function generateMongoExport({
  format,
  survey,
}: {
  format: "json" | "csv";
  survey: SurveyEdition;
}) {
  const surveySlug = survey.slug!;
  // run the export

  let filePath;
  switch (format) {
    case "json": {
      filePath = makeFilePath(surveySlug, "json");
      break;
    }
    case "csv": {
      filePath = makeFilePath(surveySlug, "csv");
      break;
    }
    default: {
      throw new Error(`Unknown format ${format}`);
    }
  }

  // DON'T LOG THIS COMMAND, it contains db auth info!
  const cmd = mongoExportCmd({
    filePath,
    survey,
    format,
  });
  console.log("Start running mongo export with command:", cmd.replace(/\/\/(.*?)@/, '//username:password@'));
  await execAsPromise(cmd);
  console.log("Export successfully created", filePath);
  return filePath;
}

export async function generateExportsZip(survey: SurveyEdition) {
  const surveySlug = survey.slug!;
  let filePaths: Array<string> = [];
  const jsonFilePath = await generateMongoExport({
    format: "json",
    survey,
  });
  filePaths.push(jsonFilePath);
  // TODO: generate a zip of the JSON + the CSV
  // Currently only the JSON is streamed back
  const csvFilePath = await generateMongoExport({ format: "csv", survey });
  filePaths.push(csvFilePath);

  const zipFilePath = makeFilePath(surveySlug, "zip", true);
  const zipCmd = `zip ${zipFilePath} ${filePaths.join(" ")}`;
  await execAsPromise(zipCmd);
  // Now zipFilePath should exist
  return zipFilePath;
}
