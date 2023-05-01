"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import type { SurveySection, SurveyEdition } from "@devographics/core-models";
import { ResponseDocument } from "@devographics/core-models";
import { getSectionCompletionPercentage } from "~/responses/helpers";
import { useFormContext } from "@devographics/react-form";
import { getEditionSectionPath } from "~/surveys/helpers";
import { useRouter } from "next/navigation";
import { captureException } from "@sentry/nextjs";
import { saveSurvey } from "../page/services";
import { EditionMetadata } from "@devographics/types";

const SurveyNavItem = ({
  edition,
  response,
  section,
  number,
  setShown,
  currentTabindex,
  setCurrentFocusIndex,
  setNavLoading,
  readOnly,
}: {
  edition: EditionMetadata;
  response: ResponseDocument;
  section: SurveySection;
  number: any;
  setShown: (boolean) => void;
  currentTabindex?: number | null;
  setCurrentFocusIndex: (index: number | null) => void;
  setCurrentTabindex: (index: number | null) => void;
  setNavLoading: (navLoading: boolean) => void;
  readOnly?: boolean;
}) => {
  const router = useRouter();
  const textInput = useRef<any>(null);
  const completion = getSectionCompletionPercentage(section, response);
  const showCompletion = completion !== null && completion > 0;

  const formContext = useFormContext();
  const { getDocument, currentValues } = formContext;
  const document = getDocument();

  useEffect(() => {
    if (currentTabindex === number) {
      textInput.current?.focus();
    }
  }, [currentTabindex]);

  const handleClick = async (e) => {
    setNavLoading(true);
    e.preventDefault();
    setShown(false);
    const res = await saveSurvey(edition, {
      id: document._id,
      data: currentValues,
    });
    if (res.error) {
      console.error(res.error);
      captureException(res.error);
    }
    setNavLoading(false);
    router.push(getEditionSectionPath({ edition, response, number }));
  };

  return (
    <li className="section-nav-item">
      {/** TODO: was a NavLink previously from bootstrap */}
      <Link
        //exact={true}
        href={getEditionSectionPath({
          edition,
          number,
          forceReadOnly: readOnly,
          response,
        })}
        ref={textInput}
        tabIndex={currentTabindex === number ? 0 : -1}
        onFocus={() => {
          setCurrentFocusIndex(number);
        }}
        onBlur={() => {
          setCurrentFocusIndex(null);
        }}
        {...(!readOnly && { onClick: handleClick })}
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
