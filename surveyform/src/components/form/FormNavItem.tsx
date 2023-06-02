"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getSectionCompletionPercentage } from "~/lib/responses/helpers";
import { getEditionSectionPath } from "~/lib/surveys/helpers";
import { SectionMetadata } from "@devographics/types";
import { useEdition } from "../SurveyContext/Provider";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { FormInputProps } from "./typings";

interface SurveyNavItemProps extends FormInputProps {
  setShown: any;
  number: number;
  sectionNumber: number;
  setNavLoading: any;
  section: SectionMetadata;
  currentSection: SectionMetadata;
}

const SurveyNavItem = ({
  submitForm,
  response,
  currentSection,
  section,
  number,
  sectionNumber,
  setShown,
  stateStuff,
  readOnly,
  setNavLoading,
}: SurveyNavItemProps) => {
  const { currentTabindex, setCurrentFocusIndex } = stateStuff;
  const { locale } = useLocaleContext();
  const textInput = useRef<any>(null);
  const { edition } = useEdition();
  const completion =
    getSectionCompletionPercentage({
      edition,
      section,
      response,
    }) || 0;
  // const showCompletion = completion !== null && completion > 0;
  const showCompletion = true;

  const isCurrent = currentSection.id === section.id;
  const currentClass = isCurrent ? "section-nav-item-current" : "";
  const isBeforeCurrent = number < sectionNumber;
  const beforeClass = isBeforeCurrent ? "section-nav-item-before-current" : "";

  const path = getEditionSectionPath({
    edition,
    response,
    number,
    locale,
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
    });
  };

  return (
    <li className={`section-nav-item ${currentClass} ${beforeClass}`}>
      {/** TODO: was a NavLink previously from bootstrap */}
      <Link
        //exact={true}
        href={getEditionSectionPath({
          edition,
          number,
          forceReadOnly: readOnly,
          response,
          locale,
        })}
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
          {completion > 0 && (
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
                  stroke-width="10"
                  stroke-dasharray={`calc(${completion} * 31.4 / 100) 31.4`}
                  transform="rotate(-90) translate(-20)"
                />
              </svg>
            </>
          )}
        </span>
        <FormattedMessage
          className="section-nav-item-label"
          id={`sections.${section.intlId || section.id}.title`}
        />
      </Link>
    </li>
  );
};

export default SurveyNavItem;
