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
  return (
    <div>
      <h2>Normalization</h2>

      <nav>
        <ul>
          <li>
            <Link href={routes.admin.normalization.href({})}>All Surveys</Link>
          </li>
          {survey && (
            <BreadcrumbSegment
              level="survey"
              currentItem={survey}
              items={surveys}
              getParams={(itemId) => ({ surveyId: itemId })}
            />
          )}
          {survey && edition && (
            <>
              <BreadcrumbSegment
                level="edition"
                currentItem={edition}
                items={survey.editions}
                getParams={(itemId) => ({
                  surveyId: survey.id,
                  editionId: itemId,
                })}
              />
            </>
          )}
          {survey && edition && question && (
            <>
              <BreadcrumbSegment
                level="question"
                currentItem={question}
                items={getNormalizableQuestions({ survey, edition })}
                getParams={(itemId) => ({
                  surveyId: survey.id,
                  editionId: edition.id,
                  questionId: itemId,
                })}
              />
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

const BreadcrumbSegment = ({ currentItem, items, getParams, level }) => {
  return (
    <>
      <li>
        <span>»</span>
      </li>
      <li className="breadcrumb-segment">
        {/* <select value={edition.id} onBlur={handleNav} onChange={handleNav}>
        {survey?.editions?.map((e) => (
          <option key={e.id}>{e.id}</option>
        ))}
      </select> */}

        {level === "question" ? (
          <span> {currentItem.id}</span>
        ) : (
          <Link
            href={routes.admin.normalization.href(getParams(currentItem.id))}
          >
            {currentItem.id}
          </Link>
        )}
        <details role="list">
          <summary aria-haspopup="listbox"></summary>
          <ul role="listbox">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={routes.admin.normalization.href(getParams(item.id))}
                >
                  {item.id}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </li>
    </>
  );
};
export default Breadcrumbs;
