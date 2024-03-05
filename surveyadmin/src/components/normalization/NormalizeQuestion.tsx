"use client";

import Actions from "~/components/normalization/NormalizeQuestionActions";
import Progress from "~/components/normalization/Progress";
import Answers from "~/components/normalization/Answers";
import {
  NormalizationResponse,
  ResponsesData,
} from "~/lib/normalization/hooks";
import {
  EditionMetadata,
  SurveyMetadata,
  ResponseData,
  Entity,
  QuestionWithSection,
  CustomNormalizationDocument,
} from "@devographics/types";
import { useSegments } from "./hooks";
import {
  IndividualAnswer,
  splitResponses,
} from "~/lib/normalization/helpers/splitResponses";
import sortBy from "lodash/sortBy";

const queryClient = new QueryClient();

import {
  useQuery,
  // @ts-ignore
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { apiRoutes } from "~/lib/apiRoutes";
import { GetQuestionResponsesParams } from "~/lib/normalization/actions/getQuestionResponses";
import { Dispatch, SetStateAction, useState } from "react";

interface NormalizeQuestionProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
}
export const NormalizeQuestionWithProvider = (
  props: NormalizeQuestionProps
) => (
  <QueryClientProvider client={queryClient}>
    <NormalizeQuestion {...props} />
  </QueryClientProvider>
);

export const getDataCacheKey = ({
  surveyId,
  editionId,
  questionId,
}: GetQuestionResponsesParams) => `${surveyId}.${editionId}.${questionId}.data`;

export const getCustomNormalizationsCacheKey = ({
  surveyId,
  editionId,
  questionId,
}: GetQuestionResponsesParams) =>
  `${surveyId}.${editionId}.${questionId}.customNormalizations`;

interface ApiData<T = any> {
  data: T;
  error: any;
}

const getData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  } else {
    const result: ApiData<ResponsesData> = await response.json();
    if (result.error) {
      throw result.error;
    }
    return result.data;
  }
};

export type SegmentProps = ReturnType<typeof useSegments>;

export interface CommonNormalizationProps extends NormalizationProps {
  responsesCount: number;
  responses: NormalizationResponse[];
  questionData: ResponseData;
  questionDataQuery: string;
  entities: Entity[];
  customNormalizations: CustomNormalizationDocument[];
  allAnswers: IndividualAnswer[];
  unnormalizedAnswers: IndividualAnswer[];
  normalizedAnswers: IndividualAnswer[];
  discardedAnswers: IndividualAnswer[];
  tokenFilter: string[] | null;
  setTokenFilter: Dispatch<SetStateAction<null | string[]>>;
  variant: AnswerVariant;
  setVariant: Dispatch<SetStateAction<AnswerVariant>>;
}

export const NormalizeQuestion = (props: NormalizeQuestionProps) => {
  const { survey, edition, question } = props;
  const params = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
  };

  const responsesQuery = useQuery({
    queryKey: [getDataCacheKey(params)],
    queryFn: () =>
      getData(apiRoutes.normalization.loadQuestionResponses.href(params)),
  });
  const customNormalizationsQuery = useQuery({
    queryKey: [getCustomNormalizationsCacheKey(params)],
    queryFn: () =>
      getData(apiRoutes.normalization.loadCustomNormalizations.href(params)),
    refetchInterval: 5000,
  });

  // console.log("responsesQuery data:");
  // console.log(responsesQuery.data);
  // console.log("customNormalizationsQuery.data");
  // console.log(customNormalizationsQuery.data);

  const loading =
    responsesQuery.isPending || customNormalizationsQuery.isPending;
  return loading ? (
    <div aria-busy={true} />
  ) : (
    <Normalization
      {...props}
      responsesData={responsesQuery.data}
      customNormalizations={customNormalizationsQuery.data}
    />
  );
};

export type CustomNormalizations = {
  [key in string]: string[];
};

export type CustomNormalization = {
  responseId: string;
  tokens: string[];
};

export type AnswerVariant = "normalized" | "unnormalized" | "discarded";

export const answerVariants = [
  {
    id: "unnormalized",
    label: "Unnormalized",
    tooltip: "Answers with no matches or custom normalizations",
  },
  {
    id: "normalized",
    label: "Normalized",
    tooltip: "Answers with at least one match or custom normalization",
  },
  {
    id: "all",
    label: "All",
    tooltip: "All answers",
  },
  {
    id: "discarded",
    label: "Discarded",
    tooltip: "Empty answers, random characters, etc.",
  },
];

interface NormalizationProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesData?: ResponsesData;
  customNormalizations?: CustomNormalizationDocument[];
}
export const Normalization = (props: NormalizationProps) => {
  const {
    survey,
    edition,
    question,
    responsesData = {} as ResponsesData,
    customNormalizations = [],
  } = props;
  console.log(responsesData);
  const {
    responsesCount,
    entities,
    responses,
    questionDataPayload,
    questionDataQuery,
    durations,
  } = responsesData;

  const [tokenFilter, setTokenFilter] = useState<null | string[]>(null);
  const [variant, setVariant] = useState<AnswerVariant>("unnormalized");

  const {
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  } = useSegments();

  const {
    allAnswers,
    normalizedAnswers,
    unnormalizedAnswers,
    discardedAnswers,
  } = splitResponses(responses);

  const commonProps = {
    survey,
    edition,
    question,
    responsesData,
    responsesCount,
    responses,
    questionData: questionDataPayload?.data,
    questionDataQuery,
    entities,
    customNormalizations,
    tokenFilter,
    setTokenFilter,
    allAnswers,
    normalizedAnswers,
    unnormalizedAnswers,
    discardedAnswers,
    variant,
    setVariant,
  };

  const segmentProps = {
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  };

  return (
    <div className="admin-normalization admin-content">
      <Actions {...commonProps} {...segmentProps} />
      {segments.length > 0 && <Progress {...commonProps} {...segmentProps} />}
      {responses ? (
        <AllAnswers {...commonProps} />
      ) : (
        <div>No responses data found.</div>
      )}
    </div>
  );
};

const AllAnswers = (props: CommonNormalizationProps) => {
  return (
    <>
      <datalist id="entities-list">
        {sortBy(props.entities, (e) => e.id).map((entity, i) => (
          <option key={i} value={entity.id}></option>
        ))}
      </datalist>
      <h3>Answers ({props.allAnswers.length})</h3>
      <Answers {...props} />
      {/* <Answers {...fieldsProps} variant="unnormalized" /> */}
      {/* <Answers {...fieldsProps} variant="discarded" /> */}
    </>
  );
};
export default NormalizeQuestion;
