import Link from "next/link";
import Breadcrumbs from "~/components/normalization/Breadcrumbs";
import NormalizeEdition from "~/components/normalization/NormalizeEdition";
import {
  fetchEditionMetadata,
  fetchSurveysMetadata,
} from "@devographics/fetch";
import {
  getEditionNormalizedResponsesCount,
  getEditionResponsesCount,
} from "~/lib/normalization/normalize/helpers";
import { getNormalizableQuestions } from "~/lib/normalization/helpers/getNormalizableQuestions";
import { routes } from "~/lib/routes";

export default async function Page({ params }) {
  const { surveyId, editionId } = params;
  const { data: surveys } = await fetchSurveysMetadata();
  const survey = surveys.find((s) => s.id === surveyId)!;
  const { data: edition } = await fetchEditionMetadata({ surveyId, editionId });
  const questions = getNormalizableQuestions({ survey, edition });
  const responsesCount = await getEditionResponsesCount({ survey, edition });
  const normResponsesCount = await getEditionNormalizedResponsesCount({
    survey,
    edition,
  });
  return (
    <div>
      <Breadcrumbs surveys={surveys} survey={survey} edition={edition} />

      <p>
        {responsesCount} raw responses, {normResponsesCount} normalized
        responses
      </p>

      <NormalizeEdition
        responsesCount={responsesCount}
        normResponsesCount={normResponsesCount}
        survey={survey}
        edition={edition}
      />

      <h4>Normalizeable Questions</h4>
      {questions.map((question) => (
        <Question
          key={question.id}
          survey={survey}
          edition={edition}
          question={question}
        />
      ))}
    </div>
  );
}

// const Section = ({ survey, edition, section }) => {
//   return (
//     <div>
//       <h3>{section.id}</h3>
//       <ul>
//         {section.questions.map((question) => (
//           <li key={edition.id}>
//             <Link
//               href={routes.admin.normalization.href({
//                 surveyId: survey.id,
//                 editionId: edition.id,
//                 questionId: question.id,
//               })}
//             >
//               {question.id}
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

const Question = ({ survey, edition, question }) => {
  return (
    <li>
      <Link
        href={routes.admin.normalization.href({
          surveyId: survey.id,
          editionId: edition.id,
          questionId: question.id,
        })}
      >
        {question.id}
      </Link>
    </li>
  );
};
