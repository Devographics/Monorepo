/*

1. Show list of sections
2. For each section, compare section questions with current response document
3. Figure out completion percentage

TODO

- Simplify this by using already-parsed with getQuestionObject() outline

*/
import { useVulcanComponents } from "@vulcanjs/react-ui";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { ResponseDocument } from "@devographics/core-models";
import { getSectionCompletionPercentage } from "~/modules/responses/helpers";
import { getSurveyPath } from "~/modules/surveys/getters";
import type { SurveySection, SurveyType } from "@devographics/core-models";
import surveys from "~/surveys";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

// TODO
// const getOverallCompletionPercentage = (response) => {

// }

const SurveyNav = ({
  survey,
  response,
}: {
  survey: SurveyType;
  response?: any;
}) => {
  const Components = useVulcanComponents();
  const outline = surveys.find((o) => o.slug === survey.slug)?.outline;
  if (!outline)
    throw new Error(`Survey or outline not found for slug ${survey.slug}`);

  const [shown, setShown] = useState(false);
  const [currentTabindex, setCurrentTabindex] = useState<number | null>(null);
  const [currentFocusIndex, setCurrentFocusIndex] =
    useState<number | null>(null);

  useEffect(() => {
    const keyPressHandler = (e) => {
      if (currentFocusIndex !== null) {
        if (currentTabindex === null) {
          /*throw new Error(
            `currentFocusIndex was not null, but currentTabindex was null during keypress`
          );*/
          console.error(
            `currentFocusIndex was not null, but currentTabindex was null during keypress`
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setCurrentTabindex(currentTabindex - 1);
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCurrentTabindex(currentTabindex + 1);
        }
      }
    };
    document.addEventListener("keydown", keyPressHandler);
    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  }, [currentFocusIndex]);

  return (
    <nav
      className={`section-nav ${
        shown ? "section-nav-shown" : "section-nav-hidden"
      }`}
      aria-label={`${survey.name} ${survey.year}`}
    >
      <div className="section-nav-inner">
        <h2 className="section-nav-heading">
          <Link href={getSurveyPath({ survey, home: true })}>
            <a>
              {survey.name} {survey.year}
            </a>
          </Link>
        </h2>
        <Components.Button
          className="section-nav-head"
          onClick={(e) => {
            setShown(!shown);
          }}
        >
          <h3 className="section-nav-toc">
            <FormattedMessage id="general.table_of_contents" />
          </h3>
          <span className="section-nav-toggle">{shown ? "▼" : "▶"}</span>
        </Components.Button>
        <div className="section-nav-contents">
          <ul>
            {outline.map((section, i) => (
              <SectionNavItem
                survey={survey}
                setShown={setShown}
                response={response}
                section={section}
                number={i + 1}
                key={i}
                currentTabindex={currentTabindex}
                setCurrentTabindex={setCurrentTabindex}
                setCurrentFocusIndex={setCurrentFocusIndex}
              />
            ))}
            {/* {response && <li>Overall: {getOverallCompletionPercentage(response)}%</li>} */}
          </ul>
          <p className="completion-message">
            <FormattedMessage id="general.all_questions_optional" />
          </p>
        </div>
      </div>
    </nav>
  );
};

const SectionNavItem = ({
  survey,
  response,
  section,
  number,
  setShown,
  currentTabindex,
  setCurrentFocusIndex,
}: {
  survey: SurveyType;
  response?: ResponseDocument;
  section: SurveySection;
  number: any;
  setShown: (boolean) => void;
  currentTabindex?: number | null;
  setCurrentFocusIndex: (index: number | null) => void;
  setCurrentTabindex: (index: number | null) => void;
}) => {
  const textInput = useRef<any>(null);
  const completion = getSectionCompletionPercentage(section, response);
  const showCompletion = completion !== null && completion > 0;

  useEffect(() => {
    if (currentTabindex === number) {
      textInput.current?.focus();
    }
  }, [currentTabindex]);

  const Components = useVulcanComponents();

  return (
    <li className="section-nav-item">
      {/** TODO: was a NavLink previously from bootstrap */}
      <Link
        //exact={true}
        href={getSurveyPath({ survey, number, response })}
      >
        <a
          ref={textInput}
          tabIndex={currentTabindex === number ? 0 : -1}
          onClick={() => {
            setShown(false);
          }}
          onFocus={() => {
            setCurrentFocusIndex(number);
          }}
          onBlur={() => {
            setCurrentFocusIndex(null);
          }}
        >
          <FormattedMessage
            id={`sections.${section.intlId || section.id}.title`}
          />{" "}
          {showCompletion && (
            <span className="section-nav-item-completion">{completion}%</span>
          )}
        </a>
      </Link>
    </li>
  );
};

export default SurveyNav;
