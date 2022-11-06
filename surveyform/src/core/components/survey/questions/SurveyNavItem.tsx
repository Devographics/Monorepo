import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router.js";
import Link from "next/link";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import type { SurveySection, SurveyType } from "@devographics/core-models";
import { ResponseDocument } from "@devographics/core-models";
import { getSectionCompletionPercentage } from "~/modules/responses/helpers";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { getSurveyPath } from "~/modules/surveys/getters";

const SurveyNavItem = ({
  survey,
  response,
  section,
  number,
  setShown,
  currentTabindex,
  setCurrentFocusIndex,
  submitForm,
  setNavLoading,
}: {
  survey: SurveyType;
  response?: ResponseDocument;
  section: SurveySection;
  number: any;
  setShown: (boolean) => void;
  currentTabindex?: number | null;
  setCurrentFocusIndex: (index: number | null) => void;
  setCurrentTabindex: (index: number | null) => void;
  submitForm: () => void;
  setNavLoading: (navLoading: boolean) => void;
}) => {
  const router = useRouter();
  const textInput = useRef<any>(null);
  const completion = getSectionCompletionPercentage(section, response);
  const showCompletion = completion !== null && completion > 0;

  useEffect(() => {
    if (currentTabindex === number) {
      textInput.current?.focus();
    }
  }, [currentTabindex]);

  const Components = useVulcanComponents();

  const handleClick = async (e) => {
    setNavLoading(true);
    e.preventDefault();
    setShown(false);
    await submitForm();
    setNavLoading(false);
    router.push(getSurveyPath({ survey, response, number }));
  };

  return (
    <li className="section-nav-item">
      {/** TODO: was a NavLink previously from bootstrap */}
      <Link
        //exact={true}
        href={getSurveyPath({ survey, number, response })}
        ref={textInput}
        tabIndex={currentTabindex === number ? 0 : -1}
        onClick={handleClick}
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
      </Link>
    </li>
  );
};

export default SurveyNavItem;
