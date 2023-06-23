"use client";
import Options from "./Options";
import { normalizeResponses } from "~/lib/normalization/services";
// import Dropdown from "~/core/components/ui/Dropdown";

export const allFields = { id: "all_fields", label: "All Fields" };

const Actions = (props) => {
  const {
    allEditions,
    surveyId,
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
  // const router = useRouter();

  // get list of all normalizeable ("other") field for current survey
  const questions = [allFields, ...normalizeableFields];

  return (
    <div className="normalization-actions">
      <div className="primary">
        {/* <select
          onChange={() => {
            // build search string to update the browser URL query string
            // const search = qs.stringify({
            //   editionId: edition.id,
            //   questionId,
            // });
            // const newUrl = new URL(window.location.href);
            // newUrl.search = search;
            // router.push(newUrl);
            // setEditionId(edition.id);
          }}
        >
          {allEditions.map((edition) => (
            <option key={edition.id}>{edition.id}</option>
          ))}
        </select>{" "}
        &gt;{" "}
        <select
          onChange={() => {
            // build search string to update the browser URL query string
            // const search = qs.stringify({
            //   editionId,
            //   questionId: question.id,
            // });
            // const newUrl = new URL(window.location.href);
            // newUrl.search = search;
            // router.push(newUrl);
            // setQuestionId(question.id);
          }}
        >
          {questions.map((question) => (
            <option key={question.id}>{question.id}</option>
          ))}
        </select>{" "}
        &gt;{" "} */}
        <Options {...props} />

        <button
          onClick={() => {
            const responsesCount =
              result?.data?.getSurveyMetadata?.responsesCount;
            initializeSegments({ responsesCount, segmentSize });
          }}
        >
          Renormalize {editionId}/{isAllFields ? allFields.id : questionId}
        </button>
      </div>
      {/* <div className="secondary">
        <button
          onClick={async () => {
            const idsString = prompt("Enter comma-separated ids") || "";
            const responsesIds = idsString.split(",");
            const result = await normalizeResponses({
              surveyId,
              responsesIds,
            });
            console.log(result);
            alert("Responses normalized");
          }}
        >
          Renormalize Responses
        </button>
      </div> */}
    </div>
  );
};

export default Actions;
