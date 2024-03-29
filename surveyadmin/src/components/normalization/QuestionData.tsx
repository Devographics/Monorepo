"use client";
import {
  SurveyMetadata,
  EditionMetadata,
  ResponseData,
  Entity,
  QuestionWithSection,
  ResultsSubFieldEnum,
  Bucket,
} from "@devographics/types";
import { Fragment, useState } from "react";
import { NormToken } from "./NormToken";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import isEmpty from "lodash/isEmpty";
import { loadQuestionData } from "~/lib/normalization/services";
import ModalTrigger from "../ui/ModalTrigger";

type QuestionDataProps = {
  questionData: ResponseData;
  responses: NormalizationResponse[];
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  entities: Entity[];
};
const QuestionData = ({
  questionData,
  responses,
  survey,
  edition,
  question,
  entities,
}: QuestionDataProps) => {
  const { buckets } = questionData?.currentEdition;
  console.log(buckets);
  const bucketProps = { responses, entities };
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
                {buckets.map((bucket, index) => {
                  const { id, groupedBuckets = [] } = bucket;
                  const hasGroupedBuckets = groupedBuckets.length > 0;
                  return (
                    <Fragment key={id}>
                      <Row
                        bucket={bucket}
                        index={index}
                        hasGroupedBuckets={hasGroupedBuckets}
                        {...bucketProps}
                      />
                      {groupedBuckets?.map((groupedBucket, index) => (
                        <Row
                          key={groupedBucket.id}
                          index={index}
                          bucket={groupedBucket}
                          isGroupedBucket={true}
                          {...bucketProps}
                        />
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

const Row = ({
  bucket,
  index,
  hasGroupedBuckets = false,
  isGroupedBucket = false,
  responses,
  entities,
}: {
  bucket: Bucket;
  index: number;
  hasGroupedBuckets?: boolean;
  isGroupedBucket?: boolean;
  responses: QuestionDataProps["responses"];
  entities: QuestionDataProps["entities"];
}) => {
  const { id, count } = bucket;
  const rowClass = `row row-${isGroupedBucket ? "sub-row" : "normal-row"}`;
  return (
    <tr key={id} className={rowClass}>
      <td>{!isGroupedBucket && `${index + 1}.`}</td>
      <td>
        {isGroupedBucket && "↳ "}
        {hasGroupedBuckets ? (
          id
        ) : (
          <NormToken id={id} responses={responses} entities={entities} />
        )}
      </td>
      <td>{count}</td>
    </tr>
  );
};

export const ViewQuestionData = (props) => {
  const { questionDataQuery, responses, survey, edition, question, entities } =
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
      <textarea defaultValue={questionDataQuery} />
      <QuestionData {...props} />
    </ModalTrigger>
  );
};
