"use client";

import Actions from "~/components/normalization/NormalizeQuestionActions";
import Progress from "~/components/normalization/Progress";
import Answers from "~/components/normalization/Answers";
import {
  NormalizationResponse,
  ResponsesData,
  useQuestionResponses,
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
import QuestionData from "./QuestionData";
import { splitResponses } from "~/lib/normalization/helpers/splitResponses";

const queryClient = new QueryClient();

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { apiRoutes } from "~/lib/apiRoutes";
import { GetQuestionResponsesParams } from "~/lib/normalization/actions/getQuestionResponses";

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

interface ApiData<T = any> {
  data: T;
  error: any;
}

const dataKeys = (params: GetQuestionResponsesParams) => {
  const all = getDataCacheKey(params);
  const lists = () => [all, "list"] as const;
  const list = (filters: string) => [...lists(), { filters }] as const;
  const details = () => [all, "detail"] as const;
  const detail = (id: number) => [...details(), id] as const;
  const customNormalization = (responseId) => [
    all,
    "customNormalization",
    { responseId },
  ];
  return {
    all,
    lists,
    list,
    details,
    detail,
    customNormalization,
  };
};

const getData = async (params: GetQuestionResponsesParams) => {
  const url = apiRoutes.normalization.loadQuestionResponses.href(params);
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

export const NormalizeQuestion = (props: NormalizeQuestionProps) => {
  const { survey, edition, question } = props;
  const params = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
  };

  const query = useQuery({
    queryKey: [getDataCacheKey(params)],
    queryFn: () => getData(params),
  });

  console.log(query.data);
  const loading = query.isPending;
  return loading ? (
    <div aria-busy={true} />
  ) : (
    <Normalization {...props} responsesData={query.data} />
  );
};

export type CustomNormalizations = {
  [key in string]: string[];
};

export type CustomNormalization = {
  responseId: string;
  tokens: string[];
};

interface NormalizationProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesData?: ResponsesData;
}
export const Normalization = (props: NormalizationProps) => {
  const {
    survey,
    edition,
    question,
    responsesData = {} as ResponsesData,
  } = props;
  const {
    responsesCount,
    entities,
    responses,
    questionResult,
    customNormalizations,
    durations,
  } = responsesData;

  const questionData = questionResult?.data;

  const {
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  } = useSegments();

  const commonProps = {
    survey,
    edition,
    question,
    responsesData,
    responsesCount,
    responses,
    questionData,
    entities,
    customNormalizations,
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
      <QuestionData {...commonProps} />
      {responses ? (
        <AllAnswers {...commonProps} />
      ) : (
        <div>No responses data found.</div>
      )}
    </div>
  );
};

export type SegmentProps = ReturnType<typeof useSegments>;

export interface CommonProps extends NormalizationProps {
  responsesCount: number;
  responses: NormalizationResponse[];
  questionData: ResponseData;
  entities: Entity[];
  customNormalizations: CustomNormalizationDocument[];
}

const AllAnswers = (props: CommonProps) => {
  const {
    allAnswers,
    normalizedAnswers,
    unnormalizedAnswers,
    discardedAnswers,
  } = splitResponses(props.responses);
  const fieldsProps = {
    ...props,
    allAnswers,
    normalizedAnswers,
    unnormalizedAnswers,
    discardedAnswers,
  };
  return (
    <>
      <Answers {...fieldsProps} variant="normalized" />
      <Answers {...fieldsProps} variant="unnormalized" />
      <Answers {...fieldsProps} variant="discarded" />
    </>
  );
};
export default NormalizeQuestion;
