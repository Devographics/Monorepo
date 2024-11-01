import React, { useState, useEffect } from "react";
import QuestionLabel from "../form/QuestionLabel";
import { getSectionTokens } from "~/lib/i18n/survey";
import { questionIsCompleted } from "~/lib/responses/helpers";
import { FormLayoutProps } from "../form/FormLayout";
import { useFormStateContext } from "../form/FormStateContext";
import { useFormPropsContext } from "../form/FormPropsContext";
import { T, useI18n } from "@devographics/react-i18n";

const SurveySectionHeading = ({ section }: FormLayoutProps) => {
  const { stateStuff, response } = useFormStateContext();
  const { sectionNumber, edition } = useFormPropsContext();

  const { id, intlId } = section;
  const { itemPositions } = stateStuff;
  const { t, getMessage } = useI18n();
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const hasPrompt = !getMessage(getSectionTokens({ section }).prompt).missing; // type !== TokenType.KEY_FALLBACK;

  return (
    <div className="section-heading">
      <div className="section-heading-contents">
        <div className="section-heading-inner">
          <h2 className="section-title">
            <span className="section-title-pagenumber">
              {sectionNumber}/{edition.sections.length}
            </span>
            <T
              className="section-title-label"
              token={getSectionTokens({ section }).title}
              fallback={id}
              values={{ ...edition }}
            />
          </h2>
          {hasPrompt && (
            <p className="section-description">
              <T
                token={getSectionTokens({ section }).prompt}
                fallback={id}
                values={{ ...edition }}
              />
            </p>
          )}
        </div>
        <div className="section-toc">
          <ol>
            {section.questions
              .filter((q) => !q.hidden && !["subheading"].includes(q.template))
              .map((question) => (
                <QuestionItem
                  key={question.id}
                  edition={edition}
                  section={section}
                  question={question}
                  scrollPosition={scrollPosition}
                  itemPositions={itemPositions}
                  response={response}
                />
              ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

/*

Get the item currently in viewport

*/
const offset = 200;
export const getItemIdInViewport = (
  scrollPosition: number,
  itemPositions: { [key: string]: number }
) => {
  return Object.keys(itemPositions)
    .reverse()
    .find((id) => itemPositions[id] < scrollPosition + offset);
};

const QuestionItem = ({
  edition,
  section,
  question,
  scrollPosition,
  itemPositions,
  response,
}) => {
  const currentItemId = getItemIdInViewport(scrollPosition, itemPositions);
  const isHighlighted = currentItemId === question.id;
  const isCompleted = response
    ? questionIsCompleted({ edition, question, response })
    : false;
  return (
    <li>
      <a
        href={`#${question.id}`}
        className={`${isHighlighted ? "highlighted" : "not-highlighted"} ${
          isCompleted ? "completed" : "not-completed"
        }`}
      >
        <QuestionLabel
          section={section}
          question={question}
          formatCode={true}
          variant="short"
        />
      </a>
    </li>
  );
};

export default SurveySectionHeading;
