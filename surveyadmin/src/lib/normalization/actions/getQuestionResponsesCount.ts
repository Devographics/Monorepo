import { getRawResponsesCollection } from "@devographics/mongo";
import { getSelector } from "../helpers/getSelectors";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
  QuestionWithSection,
} from "@devographics/types";

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
