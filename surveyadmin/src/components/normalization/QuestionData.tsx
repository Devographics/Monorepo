"use client";
import {
  SurveyMetadata,
  EditionMetadata,
  QuestionMetadata,
  OptionMetadata,
  ResponseData,
  Entity,
  QuestionWithSection,
  ResultsSubFieldEnum,
  Bucket,
} from "@devographics/types";
import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import isEmpty from "lodash/isEmpty";
import { loadQuestionData } from "~/lib/normalization/services";
import ModalTrigger from "../ui/ModalTrigger";
import { NormTokenAction } from "./NormTokenAction";
import { CommonNormalizationProps } from "./NormalizeQuestion";
import { T } from "@devographics/react-i18n";
import { getOptioni18nIds } from "@devographics/i18n";

type QuestionDataProps = {
  questionData: ResponseData;
  responses: NormalizationResponse[];
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  entities: Entity[];
  setTokenFilter: CommonNormalizationProps["setTokenFilter"];
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

export const ViewQuestionData = (props) => {
  const { questionDataQuery, responses, survey, edition, question, entities } =
    props;
  const [loading, setLoading] = useState(false);
  return (
    <ModalTrigger
      isButton={false}
      label="📊 Results"
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
      <Contents {...props} />
    </ModalTrigger>
  );
};

const Contents = (props) => (
  <>
    <textarea defaultValue={props.questionDataQuery} />
    <QuestionData {...props} />
  </>
);

const QuestionData = ({
  questionData,
  responses,
  survey,
  edition,
  question,
  entities,
  setTokenFilter,
  setShowModal,
}: QuestionDataProps) => {
  const { buckets } = questionData?.currentEdition;
  const bucketProps = { responses, entities, setShowModal };
  return (
    <section>
      {isEmpty(questionData) ? (
        <p>No question data found.</p>
      ) : (
        <div>
          <p>
            This table shows aggregated counts for the subset of the data that
            has already been processed.
          </p>
          <div>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>ID</th>
                  <th>Label (entity)</th>
                  <th>Label (i18n)</th>
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
                        question={question}
                        bucket={bucket}
                        index={index}
                        hasGroupedBuckets={hasGroupedBuckets}
                        setTokenFilter={setTokenFilter}
                        {...bucketProps}
                      />
                      {groupedBuckets?.map((groupedBucket, index) => (
                        <Row
                          question={question}
                          key={groupedBucket.id}
                          index={index}
                          bucket={groupedBucket}
                          isGroupedBucket={true}
                          setTokenFilter={setTokenFilter}
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
  question,
  bucket,
  index,
  hasGroupedBuckets = false,
  isGroupedBucket = false,
  responses,
  entities,
  setTokenFilter,
  setShowModal,
}: {
  question: QuestionMetadata;
  bucket: Bucket;
  index: number;
  hasGroupedBuckets?: boolean;
  isGroupedBucket?: boolean;
  responses: QuestionDataProps["responses"];
  entities: QuestionDataProps["entities"];
  setTokenFilter: QuestionDataProps["setTokenFilter"];
  setShowModal: QuestionDataProps["setShowModal"];
}) => {
  const { id, count, entity, token } = bucket;
  const rowClass = `row row-${isGroupedBucket ? "sub-row" : "normal-row"}`;
  const label =
    entity?.nameHtml || entity?.name || token?.nameHtml || token?.name || "";
  const description = token?.descriptionClean || entity?.descriptionClean || "";

  const option = { id } as OptionMetadata;
  const i18nIds = getOptioni18nIds({ question, option });

  return (
    <tr key={id} className={rowClass}>
      <td>{!isGroupedBucket && `${index + 1}.`}</td>
      <td>
        {isGroupedBucket && "↳ "}
        {hasGroupedBuckets ? (
          id
        ) : (
          <span>
            <NormTokenAction
              id={id.replace("catchall_", "")}
              setTokenFilter={setTokenFilter}
              onClick={() => {
                setShowModal(false);
              }}
            />{" "}
            {id.includes("catchall") && <code>catch-all</code>}
          </span>
        )}
      </td>
      <td>
        <span
          data-tooltip={description}
          dangerouslySetInnerHTML={{
            __html: label,
          }}
        />
      </td>
      <td>
        <T token={i18nIds.base} fallback={"-"} />
      </td>
      <td>{count}</td>
    </tr>
  );
};
