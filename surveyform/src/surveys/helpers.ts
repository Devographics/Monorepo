/**
 * Do NOT import all surveys, these helpers works at survey level
 * This avoid bundling all surveys in a page
 */
import {
  SurveyEdition,
  SurveySection,
  SurveyEditionDescription,
  ResponseDocument,
} from "@devographics/core-models";
import {
  EditionMetadata,
  SectionMetadata,
  SurveyMetadata,
  SurveyStatusEnum,
} from "@devographics/types";
import { getQuestionObject } from "./parser/parseSurvey";


export const getEditionFieldNames = (edition: EditionMetadata) => {
  let questionFieldNames: Array<string> = [];
  edition.sections.forEach((section) => {
    section.questions &&
      section.questions.forEach((question) => {
        const questionObject = getQuestionObject({
          survey: edition.survey,
          edition,
          section,
          question,
        });
        if (!questionObject.formPaths?.response) {
          return;
        }
        questionFieldNames.push(questionObject.formPaths.response);
        if (questionObject.allowComment && questionObject.formPaths?.comment) {
          questionFieldNames.push(questionObject.formPaths?.comment);
        }
      });
  });
  // remove dups (different suffix for same question)
  const fieldNamesWithoutDups = [...new Set(questionFieldNames).values()];
  return fieldNamesWithoutDups;
};



export function getReadOnlyPath({
  survey,
}: {
  survey: SurveyEditionDescription;
}) { }
// specific section path for the form
export function getEditionSectionPath({
  edition,
  forceReadOnly,
  response,
  page,
  number,
  editionPathSegments,
}: {
  // we only need basic info about the survey
  edition: EditionMetadata;
  // forceReadOnly (no response needed in this case)
  forceReadOnly?: boolean;
  // section
  // TODO: why sometimes we have "id" vs "_id"? (_id coming from Mongo, id from Vulcan probably)
  response?: Partial<Pick<ResponseDocument, "_id" | "id">>;
  number?: any;
  page?: "thanks";
  /** [state-of-js, 2022] */
  editionPathSegments: Array<string>
}) {
  const pathSegments = [...editionPathSegments]
  // survey home
  const readOnly =
    forceReadOnly ||
    !edition.status ||
    [SurveyStatusEnum.CLOSED].includes(edition.status);

  if (readOnly) {
    const readOnlySegment = "read-only";
    pathSegments.push(readOnlySegment);
  } else {
    if (!response) throw new Error("Undefined response");
    const responseSegment = response.id || response._id;
    if (!responseSegment)
      throw new Error(
        "Response object has no id or _id. We may have failed to load your response from server."
      );
    pathSegments.push(responseSegment);
  }
  const suffixSegment = page || number || 1;
  pathSegments.push(suffixSegment);
  const path = pathSegments.join("/");
  return path;
}

export const getEditionTitle = ({
  edition,
  sectionTitle,
}: {
  edition: EditionMetadata;
  sectionTitle?: string;
}) => {
  const { year, survey } = edition;
  const { name } = survey!;
  let title = `${name} ${year}`;
  if (sectionTitle) {
    title += `: ${sectionTitle}`;
  }
  return title;
};

export const getSectionKey = (section: SectionMetadata, keyType = "title") =>
  `sections.${section.intlId || section.id}.${keyType}`;
