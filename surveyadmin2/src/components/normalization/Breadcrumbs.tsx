"use client";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import Link from "next/link";
import { getNormalizableQuestions } from "~/lib/normalization/helpers/getNormalizableQuestions";
import { routes } from "~/lib/routes";
import { useRouter } from "next/navigation";

const Breadcrumbs = ({
  surveys,
  survey,
  edition,
  question,
}: {
  surveys?: SurveyMetadata[];
  survey?: SurveyMetadata;
  edition?: EditionMetadata;
  question?: QuestionMetadata;
}) => {
  const router = useRouter();

  const handleNav = (e, params) => {
    const route = routes.admin.normalization.href(params);
    router.push(route);
  };
  const handleSurveyNav = (e) => handleNav(e, { surveyId: e.target.value });
  const handleEditionNav = (e) =>
    handleNav(e, { surveyId: survey?.id, editionId: e.target.value });
  const handleQuestionNav = (e) =>
    handleNav(e, {
      surveyId: survey?.id,
      editionId: edition?.id,
      questionId: e.target.value,
    });
  return (
    <nav>
      <ul>
        <li>
          <Link href={routes.home.href()}>Home</Link>
        </li>
        <li>
          <Link href={routes.admin.normalization.href({})}>Surveys</Link>
        </li>
        {survey && (
          <SurveySegment
            handleNav={handleSurveyNav}
            surveys={surveys}
            survey={survey}
          />
        )}
        {survey && edition && (
          <EditionSegment
            handleNav={handleEditionNav}
            survey={survey}
            edition={edition}
          />
        )}
        {survey && edition && question && (
          <QuestionSegment
            handleNav={handleQuestionNav}
            survey={survey}
            edition={edition}
            question={question}
          />
        )}
      </ul>
    </nav>
  );
};

const SurveySegment = ({ surveys, survey, handleNav }) => {
  return (
    <li>
      <select value={survey.id} onBlur={handleNav} onChange={handleNav}>
        {surveys.map((s) => (
          <option key={s.id}>{s.id}</option>
        ))}
      </select>
    </li>
  );
};
const EditionSegment = ({ survey, edition, handleNav }) => {
  return (
    <li>
      <select value={edition.id} onBlur={handleNav} onChange={handleNav}>
        {survey?.editions?.map((e) => (
          <option key={e.id}>{e.id}</option>
        ))}
      </select>
    </li>
  );
};
const QuestionSegment = ({ survey, edition, question, handleNav }) => {
  const questions = getNormalizableQuestions({ survey, edition });
  return (
    <li>
      <select value={question.id} onBlur={handleNav} onChange={handleNav}>
        {questions.map((q) => (
          <option key={q.id}>{q.id}</option>
        ))}
      </select>
    </li>
  );
};

export default Breadcrumbs;
