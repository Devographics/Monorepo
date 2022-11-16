import gql from "graphql-tag";
import { SurveyResponseFragment } from "~/modules/responses/fragments";
import { useMutation } from "@apollo/client";

export const useSaveSurveyMutation = (survey) => {
  const fragment = SurveyResponseFragment(survey);
  const fragmentName = fragment?.definitions?.[0]?.name?.value;
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