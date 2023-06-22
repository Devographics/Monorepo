import Link from "next/link";
import { fetchEditionMetadata, fetchSurveysMetadata } from "~/lib/api/fetch";
import { getNormalizableQuestions } from "~/lib/normalization/helpers";
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
  const questions = getNormalizableQuestions({ edition });
  return (
    <div>
      <h2>
        {survey.name}/{editionId}
      </h2>
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

const Section = ({ survey, edition, section }) => {
  return (
    <div>
      <h3>{section.id}</h3>
      <ul>
        {section.questions.map((question) => (
          <li key={edition.id}>
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
        ))}
      </ul>
    </div>
  );
};

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
