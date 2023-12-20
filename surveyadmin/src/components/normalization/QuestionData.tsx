"use client";
import {
  SurveyMetadata,
  EditionMetadata,
  ResponseData,
  Entity,
  QuestionWithSection,
} from "@devographics/types";
import { useState } from "react";
import { NormToken } from "./NormToken";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import isEmpty from "lodash/isEmpty";
import { loadQuestionData } from "~/lib/normalization/services";
import ModalTrigger from "../ui/ModalTrigger";

const QuestionData = ({
  questionData,
  responses,
  survey,
  edition,
  question,
  entities,
}: {
  questionData: ResponseData;
  responses: NormalizationResponse[];
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  entities: Entity[];
}) => {
  return (
    <section>
      {isEmpty(questionData) ? (
        <p>No question data found.</p>
      ) : (
        <div>
          <p>
            <p>
              This table shows aggregated counts for the subset of the data that
              has already been processed.
            </p>
          </p>
          <div>
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
                        <NormToken
                          id={id}
                          responses={responses}
                          entities={entities}
                        />
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
    </section>
  );
};

export const ViewQuestionData = (props) => {
  const { questionData, responses, survey, edition, question, entities } =
    props;
  const [loading, setLoading] = useState(false);
  return (
    <ModalTrigger
      isButton={false}
      label="📊 Question Results…"
      tooltip="View tabulated results for current question"
      header={
        <div>
          Current Normalized Results{" "}
          {/* <a
          role="button"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowData(!showData);
          }}
        >
          {showData ? "Hide" : "Show"}
        </a> */}
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
        </div>
      }
    >
      <QuestionData {...props} />
    </ModalTrigger>
  );
};
export default QuestionData;
