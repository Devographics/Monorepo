"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { ResponseDocument } from "@devographics/core-models";
import { getSectionCompletionPercentage } from "~/responses/helpers";
import { useFormContext } from "@devographics/react-form";
import { getEditionSectionPath } from "~/surveys/helpers";
import { useRouter } from "next/navigation";
import { captureException } from "@sentry/nextjs";
import { saveResponse } from "../page/services";
import { SectionMetadata } from "@devographics/types";
import { useEdition } from "../SurveyContext/Provider";
import { useLocaleContext } from "~/i18n/context/LocaleContext";

const SurveyNavItem = ({
  response,
  section,
  number,
  setShown,
  currentTabindex,
  setCurrentFocusIndex,
  setNavLoading,
  readOnly,
}: {
  response: ResponseDocument;
  section: SectionMetadata;
  number: any;
  setShown: (boolean) => void;
  currentTabindex?: number | null;
  setCurrentFocusIndex: (index: number | null) => void;
  setCurrentTabindex: (index: number | null) => void;
  setNavLoading: (navLoading: boolean) => void;
  readOnly?: boolean;
}) => {
  const { locale } = useLocaleContext();
  const router = useRouter();
  const textInput = useRef<any>(null);
  const { edition, editionHomePath, editionPathSegments } = useEdition();
  const completion = getSectionCompletionPercentage({
    edition,
    section,
    response,
  });
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
    const res = await saveResponse({
      responseId: document._id,
      data: currentValues,
    });
    if (res.error) {
      console.error(res.error);
      captureException(res.error);
    }
    setNavLoading(false);
    router.push(
      getEditionSectionPath({
        edition,
        response,
        number,
        editionPathSegments,
        locale,
      })
    );
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
          editionPathSegments,
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
