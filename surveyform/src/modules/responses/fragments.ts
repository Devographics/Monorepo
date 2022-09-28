//import { registerFragment } from 'meteor/vulcan:core';

import { SurveyDocument } from "@devographics/core-models";
import { getFragmentName } from "@vulcanjs/graphql";
import gql from "graphql-tag";
import { getSurveyFieldNames } from "../surveys/helpers";
import { Response } from "./model";

const ResponsesDefaultFragment = gql`
  ${Response.graphql.defaultFragment}
`;

/**
 * /!\ this fragment is massive as it embeds all active surveys fragments
 * @deprecated This fragment is massive, since the default fragment
 * contains fields of all surveys. It should never ever be needed
 */
export const ResponseFragment = gql`
  fragment ResponseFragment on Response {
    _id
    createdAt
    updatedAt

    pagePath

    ...${getFragmentName(ResponsesDefaultFragment)}

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
  ${ResponsesDefaultFragment}
`;

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

export const SurveyResponseFragment = (survey: SurveyDocument) => {
  const surveySpecificFragmentName = `SurveySpecificFields_${survey.slug}`;
  const surveySpecificFields = getSurveyFieldNames(survey);
  return gql`
  fragment SurveyResponseFragment on Response {
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
};

//registerFragment(/* GraphQL */
export const ResponseFragmentWithRanking = (survey: SurveyDocument) => {
  const srf = SurveyResponseFragment(survey)
  return gql`
  fragment ResponseFragmentWithRanking on Response {
    ...${getFragmentName(srf)}
    knowledgeRanking
  }
  ${srf}
`}

export const CreateResponseOutputFragment = (survey: SurveyDocument) => {
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
