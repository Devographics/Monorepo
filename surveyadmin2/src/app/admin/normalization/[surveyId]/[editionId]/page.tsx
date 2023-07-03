import Link from "next/link";
import Breadcrumbs from "~/components/normalization/Breadcrumbs";
import NormalizeEdition from "~/components/normalization/NormalizeEdition";
import { fetchEditionMetadata, fetchSurveysMetadata } from "~/lib/api/fetch";
import {
  getEditionResponsesCount,
  getNormalizableQuestions,
} from "~/lib/normalization/normalize/helpers";
import { routes } from "~/lib/routes";

export default async function Page({ params }) {
  const { surveyId, editionId } = params;
  const edition = await fetchEditionMetadata({ surveyId, editionId });
  if (!edition) {
    return (
      <div>
        No edition {surveyId}/{editionId} found.
      </div>
    );
  }
  const survey = edition.survey;
  const questions = getNormalizableQuestions({ survey, edition });
  const responsesCount = await getEditionResponsesCount({ survey, edition });
  return (
    <div>
      <Breadcrumbs survey={survey} edition={edition} />

      <NormalizeEdition
        responsesCount={responsesCount}
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
