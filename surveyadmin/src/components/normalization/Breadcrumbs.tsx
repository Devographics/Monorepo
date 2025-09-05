"use client";
import { getQuestioni18nIds } from "@devographics/i18n";
import {
  EditionMetadata,
  QuestionMetadata,
  QuestionWithSection,
  SurveyMetadata,
} from "@devographics/types";
import Link from "next/link";
import { getNormalizableQuestions } from "~/lib/normalization/helpers/getNormalizableQuestions";
import { routes } from "~/lib/routes";
import { T, useI18n } from "@devographics/react-i18n";

const Breadcrumbs = ({
  surveys,
  survey,
  edition,
  question,
  heading = null,
}: {
  surveys?: SurveyMetadata[];
  survey?: SurveyMetadata;
  edition?: EditionMetadata;
  question?: QuestionWithSection;
  heading?: React.ReactNode;
}) => {
  return (
    <div className="breadcrumbs">
      <nav>
        <ul>
          <li>
            <h3>Normalization</h3>
          </li>

          <li>
            <span>»</span>
          </li>
          {surveys && survey && edition && (
            <>
              <BreadcrumbSegment
                currentItem={{
                  id: edition.id,
                  label: edition.id,
                  path: routes.admin.normalization.href({
                    surveyId: survey.id,
                    editionId: edition.id,
                  }),
                }}
                items={surveys
                  .map((survey) =>
                    survey.editions.map((e) => ({
                      id: e.id,
                      label: e.id,
                      path: routes.admin.normalization.href({
                        surveyId: survey.id,
                        editionId: e.id,
                      }),
                    }))
                  )
                  .flat()}
              />
            </>
          )}
          {survey && edition && question && (
            <QuestionSegment
              survey={survey}
              edition={edition}
              question={question}
            />
          )}
        </ul>
      </nav>
      {heading}
    </div>
  );
};

const QuestionSegment = ({
  survey,
  edition,
  question,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
}) => {
  const { getMessage } = useI18n();

  const currentQuestionI18nIds = getQuestioni18nIds({
    section: question.section,
    question,
  });
  const currentQuestionLabel = getMessage(
    currentQuestionI18nIds.base,
    {},
    question.id
  )?.t;

  return (
    <>
      <li>
        <span>»</span>
      </li>
      <BreadcrumbSegment
        currentItem={{ id: question.id, label: currentQuestionLabel }}
        items={getNormalizableQuestions({
          survey,
          edition,
        }).map((question) => {
          const i18nIds = getQuestioni18nIds({
            section: question.section,
            question,
          });

          return {
            id: question.id,
            label: getMessage(i18nIds.base, {}, question.id)?.t,
            path: routes.admin.normalization.href({
              surveyId: survey.id,
              editionId: edition.id,
              questionId: question.id,
            }),
          };
        })}
      />
    </>
  );
};

type NavItem = {
  id: string;
  label: string;
  path?: string;
};

const BreadcrumbSegment = ({
  currentItem,
  items,
}: {
  currentItem: NavItem;
  items: NavItem[];
}) => {
  return (
    <li className="breadcrumb-segment">
      {currentItem.path ? (
        <Link href={currentItem.path}>{currentItem.label}</Link>
      ) : (
        <span> {currentItem.label}</span>
      )}

      <details role="list" className="dropdown">
        <summary aria-haspopup="listbox"></summary>
        <ul role="listbox">
          {items.map(({ id, label, path }) => {
            const isCurrent = id === currentItem.id;
            const label_ = label || id;
            return (
              <li key={id}>
                {isCurrent ? (
                  <strong>{label_}</strong>
                ) : (
                  <Link href={path!}>{label_}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </details>
    </li>
  );
};
export default Breadcrumbs;
