import Link from "next/link";
import Breadcrumbs from "~/components/normalization/Breadcrumbs";
import NormalizeEdition from "~/components/normalization/NormalizeEdition";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import {
  getEditionNormalizedResponsesCount,
  getEditionResponsesCount,
} from "~/lib/normalization/normalize/helpers";
import { getNormalizableQuestions } from "~/lib/normalization/helpers/getNormalizableQuestions";
import { routes } from "~/lib/routes";
import NormalizeResponses from "~/components/normalization/NormalizeResponses";
import { loadNormalizationPercentages } from "~/lib/normalization/services";
import { getNormalizationPercentages } from "~/lib/normalization/actions";

export default async function Page({ params }) {
  const { surveyId, editionId } = params;
  const { data: surveys } = await fetchSurveysMetadata({
    shouldGetFromCache: false,
  });
  const survey = surveys.find((s) => s.id === surveyId)!;
  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
    shouldGetFromCache: false,
  });
  const questions = getNormalizableQuestions({ survey, edition });
  const responsesCount = await getEditionResponsesCount({ survey, edition });
  const normResponsesCount = await getEditionNormalizedResponsesCount({
    survey,
    edition,
  });

  const { data: normalizationPercentages } = await getNormalizationPercentages(
    params
  );

  return (
    <div>
      <Breadcrumbs surveys={surveys} survey={survey} edition={edition} />

      <p>
        {responsesCount} raw responses, {normResponsesCount} normalized
        responses
      </p>

      <NormalizeResponses survey={survey} edition={edition} />

      <NormalizeEdition
        responsesCount={responsesCount}
        normResponsesCount={normResponsesCount}
        survey={survey}
        edition={edition}
      />

      <h4>Normalizeable Questions</h4>
      <table className="questions-list">
        <thead>
          <tr>
            <th>Question</th>
            <th>Normalization Percentage</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => (
            <Question
              key={question.id}
              survey={survey}
              edition={edition}
              question={question}
              normalizationPercentages={normalizationPercentages}
            />
          ))}
        </tbody>
      </table>
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

const Question = ({ survey, edition, question, normalizationPercentages }) => {
  const percentage = normalizationPercentages[question.id];
  return (
    <tr>
      <th>
        <Link
          href={routes.admin.normalization.href({
            surveyId: survey.id,
            editionId: edition.id,
            questionId: question.id,
          })}
        >
          {question.id}
        </Link>
      </th>
      <th>
        {percentage && (
          <div className="normalization-percentage">
            <progress value={percentage} max="100"></progress>{" "}
            <span>{percentage}%</span>
          </div>
        )}
      </th>
    </tr>
  );
};
