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
  Section,
  SectionMetadata,
  Question,
  SurveyMetadata,
} from "@devographics/types";
import yaml from "js-yaml";
import { readdir, readFile } from "fs/promises";
import { logToFile } from "@devographics/core-models/server";
import { normalizeResponse } from "~/admin/server/normalization/normalize";
import { getOrFetchEntities } from "~/modules/entities/server";

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

type EditionOutline = Section[];

type EditionObject = {
  editionId: string;
  year: number;
  data: any[];
  outline: EditionOutline;
  metadata: EditionMetadata;
};

const loadAllEditions = async (allSurveysMetadata, surveyId) => {
  // load survey outlines

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
    allEditions.push({
      editionId,
      year: metadata.year,
      data,
      outline,
      metadata,
    });
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

const getOutlineQuestion = (
  outline: EditionOutline,
  questionLabel: string,
  editionId: string
) => {
  const question = flattenOutline(outline).find(
    (q) => q.label?.trim() === questionLabel.trim()
  );
  if (!question) {
    throw new Error(
      `🔴 Could not find question outline for "${editionId}/${questionLabel}"`
    );
  }
  return question;
};

const getQuestionMetadata = (
  editionMetadata: EditionMetadata,
  question: Question,
  editionId: string
) => {
  const allQuestions = editionMetadata.sections
    .map((s) => s.questions.map((q) => ({ ...q, sectionId: s.id })))
    .flat();
  const questionMetadata = allQuestions.find((q) => q.id === question.id);
  if (!questionMetadata) {
    throw new Error(
      `🔴 Could not find question metadata for "${editionId}/${question.id}"`
    );
  }
  return questionMetadata as QuestionMetadata;
};

/*

Check if a question accepts freeform answers

*/
const getOtherId = (questionId?: string) => `${questionId}_other`;

const acceptsOtherAnswers = (outline: EditionOutline, question: Question) =>
  flattenOutline(outline).some((q) => q.id === getOtherId(question?.id));

// const getFieldPath = ({
//   editionId,
//   sectionId,
//   questionId,
// }: {
//   editionId: string;
//   sectionId: string;
//   questionId: string;
// }) => [editionId, sectionId, questionId].join("__");

/*

For a question that accepts freeform answers, take the answer string
and split it between "regular" answers that match one of the predefined options,
and "other" freeform answers

*/
const getOptionValues = (
  edition: EditionObject,
  question: Question,
  value: string
) => {
  const { editionId, outline } = edition;
  let optionsValues: string[] = [],
    otherValue: string | undefined;
  const acceptsOther = acceptsOtherAnswers(outline, question);
  // CSV fields that hold multiple values are separated with semi-columns
  const values = value.split(";");
  for (const value of values) {
    // check if a predefined matching option exists based on the option label
    const matchingOption = question.options?.find(
      (o) => String(o.label) === String(value)
    );
    if (matchingOption) {
      optionsValues.push(matchingOption.id);
    } else {
      if (acceptsOther) {
        // handle this value as an "other" answer
        otherValue = value;
      } else {
        throw new Error(
          `🔴 Could not find value "${value}" within options for "${editionId}/${question.id}"`
        );
      }
    }
  }
  return { optionsValues, otherValue };
};

export const loadTokyoDevCSV = async () => {
  const allSurveysMetadata = await fetchSurveysListGraphQL({
    apiUrl: process.env.DATA_API_URL,
  });

  const entities = await getOrFetchEntities();
  const allEditions = await loadAllEditions(allSurveysMetadata, "tokyodev");

  // initRedis(serverConfig().redisUrl);
  // const surveys = await fetchSurveysList();

  // delete all db entries

  // iterate over all editions
  for (const edition of allEditions) {
    const { editionId, year, data, outline, metadata } = edition;
    // iterate over all CSV rows
    for (const responseData of data.slice(0, 5)) {
      const document = {
        year,
        editionId,
        surveyId: "tokyodev",
      };
      // iterate over each { question: answer } field in the response
      for (const questionLabel of Object.keys(responseData)) {
        let suffix, value;

        const questionValue = responseData[questionLabel];
        if (questionLabel === "Timestamp") {
          document.createdAt = questionValue;
        } else {
          if (questionValue !== "") {
            // find the question's canonical ID across all surveys based
            // on its label
            // note: we need to refer to the YAML outline to do this because
            // the question metadata we get through the API is merged across editions
            const question = getOutlineQuestion(
              outline,
              questionLabel,
              editionId
            );

            // find the question's canonical metadata based on its ID
            const questionMetadata = getQuestionMetadata(
              metadata,
              question,
              editionId
            );

            const convertToType = (value) =>
              questionMetadata.contentType === "number" ? Number(value) : value;

            // const pathOptions = {
            //   editionId,
            //   sectionId: questionMetadata.sectionId,
            //   questionId: question.id,
            // };
            const path = questionMetadata.normPaths.response;

            // if question has options, check that the value belongs to
            // the list of acceptable options
            if (question.options) {
              const { optionsValues, otherValue } = getOptionValues(
                edition,
                question,
                questionValue
              );

              if (optionsValues.length > 0) {
                if (["single", "dropdown"].includes(question.template)) {
                  // this field accepts a single answer
                  document[path] = convertToType(optionsValues[0]);
                } else {
                  // this field accepts an array of answers
                  document[path] = optionsValues.map(convertToType);
                }
              }
              if (otherValue) {
                // handle "other" answer
                document[path] = convertToType(otherValue);
              }
            } else {
              // freeform field
              document[path] = convertToType(questionValue);
            }
          }
        }
      }
      console.log("// document");
      console.log(document);

      const normalizedDocument = await normalizeResponse({
        document,
        entities,
        surveys: allSurveysMetadata,
      });
      console.log("// normalizedDocument");
      console.log(normalizedDocument);
    }
  }
};

loadTokyoDevCSV.description = `Load data from TokyoDev CSV file.`;
