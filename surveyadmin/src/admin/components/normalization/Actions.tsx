import React from "react";
import qs from "qs";
import { useRouter } from "next/router";
import { surveysWithTemplates } from "~/surveys/withTemplates";
import Options from "./Options";
import gql from "graphql-tag";
import { MutationButton } from "~/core/components/ui/MutationButton";
import Dropdown from "~/core/components/ui/Dropdown";

export const allFields = { id: "all_fields", label: "All Fields" };

const Actions = (props) => {
  const {
    allEditions,
    editionId,
    edition,
    questionId,
    normalizeableFields,
    setEditionId,
    setQuestionId,
    onlyUnnormalized,
    isAllFields,
    initializeSegments,
    segmentSize,
  } = props;
  const router = useRouter();

  // get list of all normalizeable ("other") field for current survey
  const questions = [allFields, ...normalizeableFields];

  return (
    <div className="normalization-actions">
      <div className="primary">
        <Dropdown
          label={editionId}
          menuItems={allEditions.map((edition) => ({
            label: edition.id,
            onClick: () => {
              // build search string to update the browser URL query string
              const search = qs.stringify({
                editionId: edition.id,
                questionId,
              });
              const newUrl = new URL(window.location.href);
              newUrl.search = search;
              router.push(newUrl);
              setEditionId(edition.id);
            },
          }))}
        />{" "}
        &gt;{" "}
        <Dropdown
          label={questionId}
          menuItems={questions.map((question) => ({
            label: question.id,
            onClick: () => {
              // build search string to update the browser URL query string
              const search = qs.stringify({
                editionId,
                questionId: question.id,
              });
              const newUrl = new URL(window.location.href);
              newUrl.search = search;
              router.push(newUrl);
              setQuestionId(question.id);
            },
          }))}
        />{" "}
        &gt;{" "}
        <MutationButton
          label={`Renormalize ${editionId}/${
            isAllFields ? allFields.id : questionId
          }`}
          mutation={gql`
            mutation getSurveyMetadata(
              $editionId: String
              $questionId: String
              $onlyUnnormalized: Boolean
            ) {
              getSurveyMetadata(
                editionId: $editionId
                questionId: $questionId
                onlyUnnormalized: $onlyUnnormalized
              )
            }
          `}
          mutationArguments={{
            editionId,
            questionId: isAllFields ? null : questionId,
            onlyUnnormalized,
          }}
          successCallback={(result) => {
            const responsesCount =
              result?.data?.getSurveyMetadata?.responsesCount;
            initializeSegments({ responsesCount, segmentSize });
          }}
        />
        <Options {...props} />
      </div>
      <div className="secondary">
        <MutationButton
          label="Renormalize Responses"
          /*
          mutationOptions={{
            name: "normalizeIds",
            args: { ids: "[String]" },
          }}*/
          mutation={gql`
            mutation normalizeIds($ids: [String]) {
              normalizeIds(ids: $ids)
            }
          `}
          // Not needed when returning arguments from the mutation callback
          //mutationArguments={{}}
          submitCallback={() => {
            const idsString = prompt("Enter comma-separated ids") || "";
            const ids = idsString.split(",");
            return { mutationArguments: { ids } };
          }}
          successCallback={(result) => {
            alert("Responses normalized");
          }}
        />
      </div>
    </div>
  );
};

export default Actions;
