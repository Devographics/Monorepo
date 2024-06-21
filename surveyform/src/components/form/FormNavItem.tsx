"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getSectionCompletionPercentage } from "~/lib/responses/helpers";
import { getEditionSectionPath } from "~/lib/surveys/helpers/getEditionSectionPath";
import { SectionMetadata } from "@devographics/types";
import { useEdition } from "../SurveyContext/Provider";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { getSectionTokens } from "~/i18n/survey";
import { FormLayoutProps } from "./FormLayout";
import { useFormStateContext } from "./FormStateContext";
import { useFormPropsContext } from "./FormPropsContext";

interface SurveyNavItemProps extends Omit<FormLayoutProps, "section"> {
  setShown: any;
  number: number;
  setNavLoading: any;
  page?: "finish";
  section?: SectionMetadata;
  currentSection: SectionMetadata;
}

const SurveyNavItem = ({
  currentSection,
  section,
  number,
  setShown,
  setNavLoading,
  page,
}: SurveyNavItemProps) => {
  const { stateStuff, response, submitForm } = useFormStateContext();
  const { readOnly, sectionNumber } = useFormPropsContext();
  const { currentTabindex, setCurrentFocusIndex } = stateStuff;
  const { locale } = useLocaleContext();
  const textInput = useRef<any>(null);
  const { edition } = useEdition();
  const completion =
    (section &&
      response &&
      getSectionCompletionPercentage({
        edition,
        section,
        response,
      })) ||
    0;
  // const showCompletion = completion !== null && completion > 0;
  const showCompletion = !page && completion > 0;
  const isCurrent = currentSection.id === section?.id;
  const currentClass = isCurrent ? "section-nav-item-current" : "";
  const isBeforeCurrent = number < sectionNumber;
  const beforeClass = isBeforeCurrent ? "section-nav-item-before-current" : "";

  const isFinished = number === edition.sections.length;

  let pagei18nId;
  if (page) {
    pagei18nId = `sections.${page}.title`;
  } else if (section) {
    pagei18nId = getSectionTokens({ section }).title;
  }

  const path = getEditionSectionPath({
    edition,
    survey: edition.survey,
    response,
    number,
    locale,
    page,
    readOnly,
  });

  useEffect(() => {
    if (currentTabindex === number) {
      textInput.current?.focus();
    }
  }, [currentTabindex]);

  const handleClick = async (e) => {
    e.preventDefault();
    await submitForm({
      path,
      beforeSubmitCallback: () => {
        setShown(false);
        setNavLoading(true);
      },
      afterSubmitCallback: () => {
        setNavLoading(false);
      },
      isFinished,
    });
  };

  return (
    <li className={`section-nav-item ${currentClass} ${beforeClass}`}>
      {/** TODO: was a NavLink previously from bootstrap */}
      <Link
        //exact={true}
        href={path}
        ref={textInput}
        tabIndex={currentTabindex === number ? 0 : -1}
        onFocus={() => {
          setCurrentFocusIndex(number);
        }}
        onBlur={() => {
          setCurrentFocusIndex(null);
        }}
        className="section-nav-item-link"
        {...(!readOnly && { onClick: handleClick })}
      >
        <span className="section-nav-item-completion  btn btn-primary">
          {showCompletion && (
            <>
              <span className="section-nav-item-completion-label">
                <span>{completion}%</span>
              </span>
              <svg height="20" width="20" viewBox="0 0 20 20">
                <circle r="10" cx="10" cy="10" fill="transparent" />
                <circle
                  r="5"
                  cx="10"
                  cy="10"
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="10"
                  strokeDasharray={`calc(${completion} * 31.4 / 100) 31.4`}
                  transform="rotate(-90) translate(-20)"
                />
              </svg>
            </>
          )}
        </span>
        <FormattedMessage className="section-nav-item-label" id={pagei18nId} />
      </Link>
    </li>
  );
};

export default SurveyNavItem;
