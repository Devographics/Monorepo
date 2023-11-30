import {
  SurveyMetadata,
  EditionMetadata,
  ResponseData,
} from "@devographics/types";
import { useState } from "react";
import NormToken from "./NormToken";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import isEmpty from "lodash/isEmpty";
import { loadQuestionData } from "~/lib/normalization/services";
import { QuestionWithSection } from "~/lib/normalization/types";

const QuestionData = ({
  questionData,
  responses,
  survey,
  edition,
  question,
}: {
  questionData: ResponseData;
  responses: NormalizationResponse[];
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
}) => {
  const [showData, setShowData] = useState(false);
  const [loading, setLoading] = useState(false);
  return !isEmpty(questionData) ? (
    <div>
      <h3>
        Current Normalized Results{" "}
        <a
          role="button"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowData(!showData);
          }}
        >
          {showData ? "Hide" : "Show"}
        </a>
      </h3>
      {showData && (
        <div>
          <div>
            <p>
              This table shows aggregated counts for the subset of the data that
              has already been processed.
              <a
                role="button"
                href="#"
                aria-busy={loading}
                onClick={async (e) => {
                  setLoading(true);
                  e.preventDefault();
                  await loadQuestionData({
                    surveyId: survey.id,
                    editionId: edition.id,
                    sectionId: question.section.id,
                    questionId: question.id,
                    shouldGetFromCache: false,
                  });
                  setLoading(false);
                }}
              >
                Refresh
              </a>
            </p>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>ID</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {questionData?.currentEdition?.buckets?.map(
                  ({ id, count }, index) => (
                    <tr key={id}>
                      <td>{index + 1}.</td>
                      <td>
                        <NormToken id={id} responses={responses} />
                      </td>
                      <td>{count}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  ) : (
    <p>No question data found.</p>
  );
};

export default QuestionData;
