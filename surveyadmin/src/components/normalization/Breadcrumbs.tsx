"use client";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import Link from "next/link";
import { getNormalizableQuestions } from "~/lib/normalization/helpers/getNormalizableQuestions";
import { routes } from "~/lib/routes";

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
                  path: routes.admin.normalization.href({
                    surveyId: survey.id,
                    editionId: edition.id,
                  }),
                }}
                items={surveys
                  .map((survey) =>
                    survey.editions.map((e) => ({
                      id: e.id,
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
            <>
              <li>
                <span>»</span>
              </li>
              <BreadcrumbSegment
                currentItem={{ id: question.id }}
                items={getNormalizableQuestions({
                  survey,
                  edition,
                }).map((question) => ({
                  id: question.id,
                  path: routes.admin.normalization.href({
                    surveyId: survey.id,
                    editionId: edition.id,
                    questionId: question.id,
                  }),
                }))}
              />
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

type NavItem = {
  id: string;
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
        <Link href={currentItem.path}>{currentItem.id}</Link>
      ) : (
        <span> {currentItem.id}</span>
      )}

      <details role="list" className="dropdown">
        <summary aria-haspopup="listbox"></summary>
        <ul role="listbox">
          {items.map(({ id, path }) => {
            const isCurrent = id === currentItem.id;
            return (
              <li key={id}>
                {isCurrent ? (
                  <strong>{id}</strong>
                ) : (
                  <Link href={path!}>{id}</Link>
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
