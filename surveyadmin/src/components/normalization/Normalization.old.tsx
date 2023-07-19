// "use client";

// import { useState } from "react";
// import Actions from "~/components/normalization/NormalizeQuestionActions";
// import Progress from "~/components/normalization/Progress";
// import Fields from "~/components/normalization/Fields";
// import { allFields } from "./NormalizeQuestionActions";
// import {
//   UnnormalizedData,
//   useUnnormalizedData,
// } from "~/lib/normalization/hooks";
// import {
//   EditionMetadata,
//   QuestionMetadata,
//   SurveyMetadata,
// } from "@devographics/types";
// import { NormalizeInBulkResult } from "~/lib/normalization/types";
// import { useSegments } from "./hooks";

// export const NormalizationDashboard = (props: {
//   surveys: SurveyMetadata[];
//   survey: SurveyMetadata;
//   edition: EditionMetadata;
//   question: QuestionMetadata;
// }) => {
//   const { survey, edition, question } = props;
//   const { data, loading, error } = useUnnormalizedData({
//     surveyId: survey.id,
//     editionId: edition.id,
//     questionId: question.id,
//   });
//   return loading ? (
//     <div aria-busy={true} />
//   ) : data ? (
//     <Normalization {...props} data={data} />
//   ) : (
//     <div>no data found.</div>
//   );
// };

// export const Normalization = ({
//   surveys,
//   survey,
//   edition,
//   question,
//   data,
// }: {
//   surveys: SurveyMetadata[];
//   survey: SurveyMetadata;
//   edition: EditionMetadata;
//   question: QuestionMetadata;
//   data: UnnormalizedData;
// }) => {
//   const { responsesCount, unnormalizedResponses } = data;
//   const allEditions = surveys.map((s) => s.editions).flat();

//   // const [responsesCount, setResponsesCount] = useState(0);

//   const {
//     initializeSegments,
//     updateSegments,
//     doneCount,
//     enabled,
//     setEnabled,
//     segments,
//   } = useSegments();

//   const isAllFields = questionId === allFields.id;
//   const onlyUnnormalized = normalizationMode === "only_normalized";

//   const props = {
//     allEditions,
//     survey,
//     edition,
//     question,
//     // unnormalizedFieldsLoading: loading,
//     unnormalizedResponses,
//     onlyUnnormalized,
//     refetchMissingFields: () => {},
//     isAllFields,
//     initializeSegments,
//     updateSegments,
//     doneCount,
//     enabled,
//     setEnabled,
//     segments,
//   };

//   return (
//     <div className="admin-normalization admin-content">
//       <Actions {...props} />
//       {segments.length > 0 && <Progress {...props} />}
//       <Fields {...props} />
//     </div>
//   );
// };

// export default NormalizationDashboard;
