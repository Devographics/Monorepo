import gql from "graphql-tag";
import { SurveyResponseFragment } from "~/modules/responses/fragments";
import { useMutation } from "@apollo/client";
import { getFragmentName} from '@vulcanjs/graphql'

export const useSaveSurveyMutation = (survey) => {
  const fragment = SurveyResponseFragment(survey);
  const fragmentName = getFragmentName(fragment);
  const mutation = gql`
  mutation saveSurvey($input: UpdateResponseInput) {
    saveSurvey(input: $input) {
      data {
        ...${fragmentName}
      }
    }
  }
  ${fragment}
`;
  const [saveSurvey, { data, loading, error }] = useMutation(mutation);
  return { saveSurvey, data, loading, error };
};