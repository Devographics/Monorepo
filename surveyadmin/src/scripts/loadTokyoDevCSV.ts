import {
  fetchSurveysList,
  fetchSurveysListGraphQL,
  initRedis,
} from "@devographics/core-models/server";
import { serverConfig } from "~/config/server";
import fs from "fs";
import csvParser from "csv-parser";
import {
  Edition,
  EditionMetadata,
  QuestionMetadata,
  SectionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import yaml from "js-yaml";
import { readdir, readFile } from "fs/promises";
import { logToFile } from "@devographics/core-models/server";

const editions = {
  // td2019: "International Developers in Japan Survey 2019.csv",
  td2020: "International Developers in Japan Survey 2020.csv",
  td2021: "International Developers in Japan Survey 2021.csv",
  td2022: "International Developers in Japan Survey 2022.csv",
};

async function parseCSVFile<T>(filename: string): Promise<T[]> {
  const rows: T[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filename)
      .pipe(csvParser())
      .on("data", (data: any) => {
        const row = {} as T;
        for (const [key, value] of Object.entries(data)) {
          row[key] = value;
        }
        rows.push(row);
      })
      .on("end", () => {
        resolve();
      })
      .on("error", (error: Error) => {
        reject(error);
      });
  });

  return rows;
}

const loadYamlFile = async (surveyId) => {
  const contents = await readFile(
    `../../tokyodev-surveys/tokyodev/${surveyId}/questions.yml`,
    "utf8"
  );
  const yamlContents: any = yaml.load(contents);
  return yamlContents;
};

type EditionOutline = SectionMetadata[];

type EditionObject = {
  id: string;
  data: any[];
  outline: EditionOutline;
  metadata: EditionMetadata;
};

const loadAllEditions = async (surveyId) => {
  // load survey outlines
  const allSurveysMetadata = await fetchSurveysListGraphQL({
    apiUrl: process.env.DATA_API_URL,
  });

  const allEditions: EditionObject[] = [];
  for (const editionId of Object.keys(editions)) {
    const fileName = editions[editionId];

    const data = await parseCSVFile<any>(`../../tokyodev-data/${fileName}`);
    const outline = await loadYamlFile(editionId);
    const survey = allSurveysMetadata.find(
      (s) => s.id === surveyId
    ) as SurveyMetadata;
    const metadata = survey.editions.find(
      (e) => e.id === editionId
    ) as EditionMetadata;
    allEditions.push({ id: editionId, data, outline, metadata });
  }
  await logToFile(
    "tokyodev.yml",
    allEditions.map(({ data, ...rest }) => rest),
    { mode: "overwrite" }
  );
  return allEditions;
};

const flattenOutline = (outline: EditionOutline) =>
  outline.map((s) => s.questions).flat();

const getOutlineQuestion = (outline: EditionOutline, questionLabel: string) =>
  flattenOutline(outline).find((q) => q.label.trim() === questionLabel.trim());

const getQuestionMetadata = (
  editionMetadata: EditionMetadata,
  question: QuestionMetadata
) => {
  const allQuestions = editionMetadata.sections.map((s) => s.questions).flat();
  return allQuestions.find((q) => q.id === question.id);
};

const acceptsOtherAnswers = (
  outline: EditionOutline,
  question: QuestionMetadata
) => flattenOutline(outline).some((q) => q.id === `${question.id}_other`);

export const loadTokyoDevCSV = async () => {
  const allEditions = await loadAllEditions("tokyodev");

  // initRedis(serverConfig().redisUrl);
  // const surveys = await fetchSurveysList();

  // delete all db entries

  // iterate over all editions
  for (const edition of allEditions) {
    const { id, data, outline, metadata } = edition;
    // iterate over all CSV rows
    for (const responseData of data) {
      const document = {};
      // iterate over each { question: answer } field in the response
      for (const questionLabel of Object.keys(responseData)) {
        const questionValue = responseData[questionLabel];
        if (questionLabel === "Timestamp") {
          document.createdAt = questionValue;
        } else {
          if (questionValue !== "") {
            // find the question's canonical ID across all surveys based
            // on its label
            const outlineQuestion = getOutlineQuestion(outline, questionLabel);
            if (!outlineQuestion) {
              throw new Error(
                `🔴 Could not find question outline for "${id}/${questionLabel}"`
              );
            }
            // find the question's canonical metadata based on its ID
            const questionMetadata = getQuestionMetadata(
              metadata,
              outlineQuestion
            );
            if (!questionMetadata) {
              throw new Error(
                `🔴 Could not find question metadata for "${id}/${outlineQuestion.id}"`
              );
            }
            // if question has options, check that the value belongs to
            // the list of acceptable options
            if (outlineQuestion.options) {
              const acceptsOther = acceptsOtherAnswers(
                outline,
                outlineQuestion
              );
              // console.log("// acceptsOther");
              // console.log(id, outlineQuestion.id);
              // console.log(acceptsOther);
              // CSV fields that hold multiple values are separated with semi-columns
              const values = questionValue.split(";");
              for (const value of values) {
                const option = outlineQuestion.options.find(
                  (o) => String(o.label) === String(value)
                );
                if (!option) {
                  if (acceptsOther) {
                    // handle this as an "other" answer
                  } else {
                    throw new Error(
                      `🔴 Could not find value "${value}" within options for "${id}/${outlineQuestion.id}"`
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  // initialize empty new document
  // loop over each column
  // find corresponding question in survey outline
  // if no question throw error
  // if field has preset values check if row value is valid
  // if not throw error
  // add value to document
  // add document to db
};

loadTokyoDevCSV.description = `Load data from TokyoDev CSV file.`;
