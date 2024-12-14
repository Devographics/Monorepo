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
import { useLocalStorage } from "../hooks";
import {
  useQuery,
  // @ts-ignore
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

export const queryClient = new QueryClient();

import { apiRoutes } from "~/lib/apiRoutes";
import { GetQuestionResponsesParams } from "~/lib/normalization/actions/getQuestionResponses";
import { Dispatch, SetStateAction, useState } from "react";
import { ResultsPayload } from "~/lib/normalization/services";

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

export const getFrequencyCacheKey = ({
  surveyId,
  editionId,
  questionId,
}: GetQuestionResponsesParams) =>
  `${surveyId}.${editionId}.${questionId}.frequency`;

export const getCustomNormalizationsCacheKey = ({
  surveyId,
  editionId,
  questionId,
}: GetQuestionResponsesParams) =>
  `${surveyId}.${editionId}.${questionId}.customNormalizations`;

export const getSuggestedTokensKey = ({
  surveyId,
  editionId,
  questionId,
}: GetQuestionResponsesParams) =>
  `${surveyId}.${editionId}.${questionId}.suggestedTokens`;

export const getActionLogKey = ({
  surveyId,
  editionId,
  questionId,
}: GetQuestionResponsesParams) =>
  `${surveyId}.${editionId}.${questionId}.actionLog`;

interface ApiData<T = any> {
  data: T;
  error: any;
}

export const getData = async <TData = ResponsesData,>(url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  } else {
    const result: ApiData<TData> = await response.json();
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
  customAnswers: IndividualAnswer[];
  tokenFilter: string[] | null;
  setTokenFilter: (
    filterQuery: string[] | null,
    variant?: AnswerVariant
  ) => void;
  filterQuery?: string;
  setFilterQuery: (
    filterQuery: string | undefined,
    variant?: AnswerVariant
  ) => void;
  variant: AnswerVariant;
  setVariant: Dispatch<SetStateAction<AnswerVariant>>;
  actionLog: ActionLogItem[];
  addToActionLog: (
    action: Omit<ActionLogItem, "timestamp">,
    showActionLog?: boolean
  ) => void;
  showActionLog: boolean;
  setShowActionLog: Dispatch<SetStateAction<boolean>>;
  localSuggestedTokens: string[];
  addLocalSuggestedToken: (token: string) => void;
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
  const customNormalizationsQuery = useQuery<CustomNormalizationDocument[]>({
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

export type AnswerVariant =
  | "normalized"
  | "unnormalized"
  | "discarded"
  | "custom";

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
  {
    id: "custom",
    label: "Custom Normalizations",
    tooltip: "Answers with manually defined tokens",
  },
];

interface NormalizationProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesData?: ResponsesData;
  customNormalizations?: CustomNormalizationDocument[];
}

export interface ActionLogItem {
  type: "normalization";
  payload: ResultsPayload;
  timestamp: Date;
}

export const Normalization = (props: NormalizationProps) => {
  const {
    survey,
    edition,
    question,
    responsesData = {} as ResponsesData,
    customNormalizations = [],
  } = props;

  const {
    responsesCount,
    entities,
    responses,
    questionDataPayload,
    questionDataQuery,
    durations,
  } = responsesData;

  const keyParams = {
    surveyId: survey.id,
    editionId: edition.id,
    sectionId: question.section.id,
    questionId: question.id,
  };

  const [filterQuery, setFilterQuery_] = useState("");
  const [tokenFilter, setTokenFilter_] = useState<null | string[]>(null);
  const [variant, setVariant] = useState<AnswerVariant>("unnormalized");
  const [actionLog, setActionLog] = useLocalStorage<ActionLogItem[]>(
    getActionLogKey(keyParams),
    []
  );
  const [showActionLog, setShowActionLog] = useState(false);
  const addToActionLog: CommonNormalizationProps["addToActionLog"] = (
    action,
    showActionLog = true
  ) => {
    setActionLog([...actionLog, { ...action, timestamp: new Date() }]);
    if (showActionLog) {
      setShowActionLog(true);
    }
  };

  const [localSuggestedTokens, setLocalSuggestedTokens] = useLocalStorage<
    string[]
  >(getSuggestedTokensKey(keyParams), []);
  const addLocalSuggestedToken = (token: string) => {
    setLocalSuggestedTokens([...localSuggestedTokens, token]);
  };

  // setState variants that accept a second argument to also change the view
  const setFilterQuery = (filterQuery: string, variant?: AnswerVariant) => {
    setFilterQuery_(filterQuery);
    if (variant) {
      setVariant(variant);
    }
  };

  const setTokenFilter = (
    tokenFilter: null | string[],
    variant?: AnswerVariant
  ) => {
    setTokenFilter_(tokenFilter);
    if (variant) {
      setVariant(variant);
    }
  };

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
    customAnswers,
  } = splitResponses(responses);

  const commonProps: CommonNormalizationProps = {
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
    customAnswers,
    variant,
    setVariant,
    actionLog,
    addToActionLog,
    showActionLog,
    setShowActionLog,
    filterQuery,
    setFilterQuery,
    localSuggestedTokens,
    addLocalSuggestedToken,
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
      <pre>
        <code>cn: {customNormalizations.length}</code>
      </pre>
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
        {props.localSuggestedTokens.map((t) => (
          <option key={t} value={t}></option>
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
