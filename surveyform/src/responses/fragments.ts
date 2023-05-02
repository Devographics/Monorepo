import { SurveyEdition } from "@devographics/core-models";
import { EditionMetadata } from "@devographics/types";
import { getFragmentName } from "@vulcanjs/graphql";
import gql from "graphql-tag";
import { getSurveyFieldNames } from "~/surveys/helpers";

/**
 * Doesn't include survey specifics
 */
export const LightweightResponseFragment = gql`
  fragment LightweightResponseFragment on Response {
    _id
    createdAt
    updatedAt
    pagePath

    user {
      _id
      displayName
      pagePath
    }
    userId

    survey {
      name
      year
      status
      slug
      surveyId
      editionId
      prettySlug
    }
  }
`;

export const SurveyResponseFragment = (edition: EditionMetadata) => {
  const responseSpecificFragmentName = `SurveyResponseFragment_${edition.id}`;
  const surveySpecificFragmentName = `SurveySpecificFields_${edition.id}`;
  const surveySpecificFields = getSurveyFieldNames(edition);
  if (surveySpecificFields.length > 0) {
    //console.log("name", responseSpecificFragmentName, surveySpecificFragmentName, surveySpecificFields)
    return gql`
  fragment ${responseSpecificFragmentName} on Response {
    _id
    createdAt
    updatedAt
    pagePath
    user {
      _id
      displayName
      pagePath
    }
    userId
    survey {
      name
      year
      status
      slug
      surveyId
    }
    surveySlug
    ...${surveySpecificFragmentName}
  }
  fragment ${surveySpecificFragmentName} on Response {
    ${surveySpecificFields.join("\n")}
  }
`;
  } else {
    // TODO: is this scenario expected??
    console.log("No survey specific fields on response");
    return gql`
    fragment ${responseSpecificFragmentName} on Response {
      _id
      createdAt
      updatedAt
      pagePath
      user {
        _id
        displayName
        pagePath
      }
      userId
      survey {
        name
        year
        status
        surveyId
        editionId
      }
      surveySlug
      editionId
      surveyId
    }
  `;
  }
};

//registerFragment(/* GraphQL */
export const ResponseFragmentWithRanking = (edition: EditionMetadata) => {
  const srf = SurveyResponseFragment(edition);
  return gql`
  fragment ResponseFragmentWithRanking on Response {
    ...${getFragmentName(srf)}
    knowledgeRanking
  }
  ${srf}
`;
};

export const CreateResponseOutputFragment = (edition: EditionMetadata) => {
  const surveySpecificFragment = SurveyResponseFragment(edition);
  return gql`
  fragment CreateResponseOutputFragment on ResponseMutationOutput {
    data {
      ...${getFragmentName(surveySpecificFragment)}
    }
  }
  ${surveySpecificFragment}
`;
};
