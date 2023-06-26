import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import Link from "next/link";
import { routes } from "~/lib/routes";

const Breadcrumbs = ({
  survey,
  edition,
  question,
}: {
  survey?: SurveyMetadata;
  edition?: EditionMetadata;
  question?: QuestionMetadata;
}) => {
  return (
    <nav>
      <ul>
        <li>
          <Link href={routes.admin.normalization.href({})}>Surveys</Link>
        </li>
        {survey && (
          <li>
            /
            <Link
              href={routes.admin.normalization.href({ surveyId: survey.id })}
            >
              {survey.name}
            </Link>
          </li>
        )}
        {survey && edition && (
          <li>
            /
            <Link
              href={routes.admin.normalization.href({
                surveyId: survey.id,
                editionId: edition.id,
              })}
            >
              {edition.id}
            </Link>
          </li>
        )}
        {survey && edition && question && (
          <li>
            /
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
        )}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
