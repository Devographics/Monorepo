import {
  fetchSurveysList,
  fetchSurveysListGraphQL,
  initRedis,
} from "@devographics/core-models/server";
import { serverConfig } from "~/config/server";
import fs from "fs";
import csvParser from "csv-parser";
import type {
  Survey,
  Edition,
  EditionMetadata,
  QuestionMetadata,
  Section,
  SectionMetadata,
  Question,
  SurveyMetadata,
  TemplateFunction,
} from "@devographics/types";
import yaml from "js-yaml";
import { readdir, readFile } from "fs/promises";
import { logToFile } from "@devographics/core-models/server";
import { normalizeResponse } from "~/admin/server/normalization/normalize";
import { getOrFetchEntities } from "~/modules/entities/server";
import { getEditionQuestionsFlat } from "~/admin/server/normalization/helpers";
import * as templateFunctions from "@devographics/templates";
import { loadOrGetSurveys } from "~/modules/surveys/load";

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
  const allQuestions = getEditionQuestionsFlat(editionMetadata);
  const questionMetadata = allQuestions.find((q) => q.id === question.id);
  if (!questionMetadata) {
    throw new Error(
      `🔴 Could not find question metadata for "${editionId}/${question.id}"`
    );
  }
  return questionMetadata as QuestionMetadata;
};

// const getFieldPath = ({
//   editionId,
//   sectionId,
//   questionId,
// }: {
//   editionId: string;
//   sectionId: string;
//   questionId: string;
// }) => [editionId, sectionId, questionId].join("__");

function findClosestValue(arr, target) {
  let closest = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (Math.abs(target - arr[i]) < Math.abs(target - closest)) {
      closest = arr[i];
    }
  }
  return closest;
}

/*

For a question that accepts predefined answers, take the answer string
and split it between "regular" answers that match one of the predefined options,
and "other" freeform answers

*/
const getOptionValues = (
  edition: EditionObject,
  question: Question,
  value_: string,
  questionLabel: string
) => {
  const { editionId, outline } = edition;
  let optionsValues: (string | number)[] = [],
    otherValue: string | undefined;

  // if this is a number question that has options defined, take the provided number
  // and replace it with the closest available option
  const value =
    question.template === "number"
      ? String(
          findClosestValue(
            question.options?.map((o) => o.id),
            Number(value_)
          )
        )
      : value_;

  // CSV fields that hold multiple values are separated with semi-columns
  const values = value.split(";");
  for (const value of values) {
    // check if a predefined matching option exists based on the option label
    // or the option id, for question whose options are generated from a template
    const matchingOption = question.options?.find(
      (o) => String(o.label) === String(value) || String(o.id) === String(value)
    );
    if (matchingOption) {
      optionsValues.push(matchingOption.id);
    } else {
      if (question.allowOther) {
        // handle this value as an "other" answer
        otherValue = value;
      } else {
        console.log(question);
        throw new Error(
          `🔴 Could not find value "${value}" within options for ${editionId}/${question.id} ("${questionLabel})"`
        );
      }
    }
  }
  return { optionsValues, otherValue };
};

export const loadTokyoDevCSV = async () => {
  const allSurveysMetadata = await loadOrGetSurveys({ forceReload: true });
  const entities = await getOrFetchEntities();
  const survey = allSurveysMetadata.find((s) => s.id === "tokyodev") as Survey;
  const allEditions = await loadAllEditions(allSurveysMetadata, "tokyodev");

  // initRedis(serverConfig().redisUrl);
  // const surveys = await fetchSurveysList();

  // delete all db entries

  // iterate over all editions
  for (const edition of allEditions) {
    const { editionId, year, data, outline, metadata } = edition;
    let i = 0;

    // iterate over all CSV rows
    for (const responseData of data) {
      i++;
      const _id = `${editionId}_${i}`;
      console.log(`Processing response ${_id}…`);
      const document = {
        year,
        editionId,
        surveyId: "tokyodev",
        _id,
      };
      // iterate over each { question: answer } field in the response
      for (const questionLabel of Object.keys(responseData)) {
        const questionValue = responseData[questionLabel];

        if (questionLabel === "Timestamp") {
          document.createdAt = new Date(questionValue);
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
            const templateFunction = templateFunctions[
              questionMetadata.template
            ] as TemplateFunction;
            if (!templateFunction) {
              throw new Error(
                `// No template ${questionMetadata.template} found`
              );
            }

            const section = { id: questionMetadata.sectionId } as Section;

            const questionObject = templateFunction({
              survey,
              edition: edition.metadata,
              section,
              question,
            });

            const { rawPaths } = questionObject;

            if (!rawPaths) {
              console.log("// no rawPaths");
              console.log(questionObject);
            } else {
              // if question has options, check that the value belongs to
              // the list of acceptable options
              if (questionObject.options) {
                const { optionsValues, otherValue } = getOptionValues(
                  edition,
                  questionObject,
                  questionValue,
                  questionLabel
                );

                if (optionsValues.length > 0) {
                  if (
                    ["single", "dropdown"].includes(questionObject.template)
                  ) {
                    // this field accepts a single answer
                    document[rawPaths.response] = convertToType(
                      optionsValues[0]
                    );
                  } else {
                    // this field accepts an array of answers
                    document[rawPaths.response] =
                      optionsValues.map(convertToType);
                  }
                }
                if (otherValue) {
                  // handle "other" answer
                  document[rawPaths.other] = convertToType(otherValue);
                }
              } else {
                // freeform field
                document[rawPaths.response] = convertToType(questionValue);
              }
            }
          }
        }
      }
      // console.log("// document");
      // console.log(document);

      const normalizedDocument = await normalizeResponse({
        document,
        entities,
        surveys: allSurveysMetadata,
        verbose: true,
      });

      // logToFile(`${_id}.yml`, normalizedDocument, { mode: "overwrite" });
    }
  }
};

loadTokyoDevCSV.description = `Load data from TokyoDev CSV file.`;
