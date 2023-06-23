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
    <h3>
      <Link href={routes.admin.normalization.href({})}>Surveys</Link>
      {survey && (
        <span>
          /
          <Link href={routes.admin.normalization.href({ surveyId: survey.id })}>
            {survey.name}
          </Link>
        </span>
      )}
      {edition && (
        <span>
          /
          <Link
            href={routes.admin.normalization.href({
              surveyId: survey.id,
              editionId: edition.id,
            })}
          >
            {edition.id}
          </Link>
        </span>
      )}
      {question && (
        <span>
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
        </span>
      )}
    </h3>
  );
};

export default Breadcrumbs;
