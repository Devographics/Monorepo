import Link from "next/link";
import Breadcrumbs from "~/components/normalization/Breadcrumbs";
import NormalizeEdition from "~/components/normalization/NormalizeEdition";
import {
  getEditionNormalizedResponsesCount,
  getEditionResponsesCount,
} from "~/lib/normalization/normalize/helpers";
import { getNormalizableQuestions } from "~/lib/normalization/helpers/getNormalizableQuestions";
import { routes } from "~/lib/routes";
import NormalizeResponses from "~/components/normalization/NormalizeResponses";
import {
  NormalizationProgressStats,
  getNormalizationPercentages,
} from "~/lib/normalization/actions";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import RecalculateProgress from "~/components/normalization/RecalculateProgress";
import sumBy from "lodash/sumBy";
import {
  rscEditionMetadataAdmin,
  rscSurveysMetadata,
} from "~/fetchers/rscEditionMetadata";

export default async function Page(props) {
  const params = await props.params;
  const { surveyId, editionId } = params;
  const { data: surveys } = await rscSurveysMetadata({
    shouldGetFromCache: true,
    addCredits: false,
  });
  const { survey, edition } = await rscEditionMetadataAdmin({
    surveyId,
    editionId,
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

      <h4>
        Normalizeable Questions{" "}
        <RecalculateProgress survey={survey} edition={edition} />
      </h4>
      <p>
        {sumBy(
          Object.keys(normalizationPercentages),
          (key) => normalizationPercentages[key].totalCount
        )}{" "}
        total answers
      </p>
      <table className="questions-list">
        <thead>
          <tr>
            <th></th>
            <th>Question</th>
            <th colSpan={99}>Normalization Progress</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question, i) => (
            <Question
              key={question.id}
              index={i}
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

const hasLowProgress = (stats) =>
  stats.percentage < 75 && stats.totalCount - stats.normalizedCount > 200;

const Question = ({
  index,
  survey,
  edition,
  question,
  normalizationPercentages,
}: {
  index: number;
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  normalizationPercentages: NormalizationProgressStats;
}) => {
  const stats = normalizationPercentages?.[question.id];
  return (
    <tr>
      <th>{index + 1}.</th>
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
      <td>
        {stats && stats.totalCount > 0 && (
          <div
            className={`normalization-progress ${
              hasLowProgress(stats)
                ? "normalization-progress-low"
                : "normalization-progress-normal"
            }`}
          >
            <progress value={stats.percentage} max="100"></progress>{" "}
          </div>
        )}
      </td>
      <td>
        {stats && (
          <p
            className={`normalization-percentage ${
              hasLowProgress(stats) ? "normalization-percentage-low" : ""
            }`}
          >
            {stats.percentage}% ({stats.unnormalizedCount} remaining out of{" "}
            {stats.totalCount})
          </p>
        )}
      </td>
    </tr>
  );
};
