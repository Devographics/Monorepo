import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveysMetadata } from "../../api/fetch";
import { getSelector } from "../helpers/getSelectors";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import type { QuestionWithSection } from "~/lib/normalization/types";

type GetQuestionResponsesCountArgs = {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question?: QuestionWithSection;
  onlyUnnormalized?: boolean;
};

export const getQuestionResponsesCount = async ({
  survey,
  edition,
  question,
  onlyUnnormalized,
}: GetQuestionResponsesCountArgs) => {
  const selector = await getSelector({
    survey,
    edition,
    question,
    onlyUnnormalized,
  });

  const rawResponsesCollection = await getRawResponsesCollection(survey);
  const responsesCount = await rawResponsesCollection.countDocuments(selector);

  return responsesCount;
};
