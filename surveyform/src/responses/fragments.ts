import { SurveyEdition } from "@devographics/core-models";
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
      prettySlug
    }
  }
`;

export const SurveyResponseFragment = (survey: SurveyEdition | SurveyEdition) => {
  const responseSpecificFragmentName = `SurveyResponseFragment_${survey.slug}`;
  const surveySpecificFragmentName = `SurveySpecificFields_${survey.slug}`;
  const surveySpecificFields = getSurveyFieldNames(survey);
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
      prettySlug
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
    console.log("No survey specific fields on response")
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
        prettySlug
      }
      surveySlug
    }
  `
  };
}

//registerFragment(/* GraphQL */
export const ResponseFragmentWithRanking = (survey: SurveyEdition | SurveyEdition) => {
  const srf = SurveyResponseFragment(survey)
  return gql`
  fragment ResponseFragmentWithRanking on Response {
    ...${getFragmentName(srf)}
    knowledgeRanking
  }
  ${srf}
`}

export const CreateResponseOutputFragment = (survey: SurveyEdition | SurveyEdition) => {
  const surveySpecificFragment = SurveyResponseFragment(survey);
  return gql`
  fragment CreateResponseOutputFragment on ResponseMutationOutput {
    data {
      ...${getFragmentName(surveySpecificFragment)}
    }
  }
  ${surveySpecificFragment}
`;
};
