import React, { useState, useEffect } from "react";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import QuestionLabel from "../form/QuestionLabel";
import { FormInputProps } from "../form/typings";
import { getSectioni18nIds } from "@devographics/i18n";
import { questionIsCompleted } from "~/lib/responses/helpers";
import { useIntlContext } from "@devographics/react-i18n";
import { FormLayoutProps } from "../form/FormLayout";

const SurveySectionHeading = ({
  section,
  sectionNumber,
  edition,
  stateStuff,
  response,
}: FormLayoutProps) => {
  const { id, intlId } = section;
  const { itemPositions } = stateStuff;
  const intl = useIntlContext();
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const description = intl.formatMessage({
    id: getSectioni18nIds({ section }).description,
  });
  return (
    <div className="section-heading">
      <div className="section-heading-contents">
        <div className="section-heading-inner">
          <h2 className="section-title">
            <span className="section-title-pagenumber">
              {sectionNumber}/{edition.sections.length}
            </span>
            <FormattedMessage
              className="section-title-label"
              id={getSectioni18nIds({ section }).title}
              defaultMessage={id}
              values={{ ...edition }}
            />
          </h2>
          {description && (
            <p className="section-description">
              <FormattedMessage
                id={getSectioni18nIds({ section }).description}
                defaultMessage={id}
                values={{ ...edition }}
              />
            </p>
          )}
        </div>
        <div className="section-toc">
          <ol>
            {section.questions
              .filter((q) => !q.hidden)
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
const getItemIdInViewport = (
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
