"use client";
import { useEffect } from "react";
import { T, useI18n } from "@devographics/react-i18n";
import { useRouter } from "next/navigation";
import { LoadingButton } from "~/components/ui/LoadingButton";
import { getEditionSectionPath } from "~/lib/surveys/helpers/getEditionSectionPath";
import { SectionMetadata } from "@devographics/types";
import { useEdition } from "~/components/SurveyContext/Provider";
import Link from "next/link";
import { useState } from "react";
import { getSectionTokens } from "~/lib/i18n/survey";
import { FormLayoutProps } from "./FormLayout";
import { useFormPropsContext } from "./FormPropsContext";
import { useFormStateContext } from "./FormStateContext";
import { Button } from "~/components/ui/Button";

//

interface FormSubmitProps extends FormLayoutProps {
  path: string;
  nextSection: SectionMetadata;
  previousSection: SectionMetadata;
}

export const FormSubmit = (props: FormLayoutProps) => {
  const { readOnly, sectionNumber } = useFormPropsContext();
  const { response } = useFormStateContext();
  const { nextSection, previousSection } = props;

  const { locale } = useI18n();
  const { edition } = useEdition();
  const router = useRouter();

  const pathProps = { readOnly, edition, survey: edition.survey, response };

  // in "outline" mode, there is no last step
  let nextState: "finish" | "next" | undefined;
  let nextPath;
  if (nextSection) {
    nextState = "next";
    nextPath = getEditionSectionPath({
      ...pathProps,
      number: sectionNumber + 1,
      locale,
    });
  } else if (response) {
    nextState = "finish";
    nextPath = getEditionSectionPath({
      ...pathProps,
      page: "finish",
      locale,
    });
  }
  useEffect(() => {
    if (nextPath) {
      // Prefetch the next page
      router.prefetch(nextPath);
    }
  }, [nextPath]);

  return (
    <div className={`form-submit form-section-nav`}>
      <div className="form-submit-actions">
        {nextState === "next" && (
          <SubmitButton
            {...props}
            type="next"
            intlId={getSectionTokens({ section: nextSection }).title}
            path={nextPath}
          />
        )}
        {nextState === "finish" && (
          <SubmitButton
            {...props}
            type="next"
            intlId="general.finish_survey"
            path={nextPath}
          />
        )}
        {previousSection ? (
          <SubmitButton
            {...props}
            type="previous"
            intlId={getSectionTokens({ section: previousSection }).title}
            path={getEditionSectionPath({
              ...pathProps,
              number: sectionNumber - 1,
              locale,
            })}
          />
        ) : (
          <div className="prev-placeholder" />
        )}
      </div>
    </div>
  );
};

interface SubmitButtonProps extends FormSubmitProps {
  intlId: string;
  type: "previous" | "next";
}

const SubmitButton = (props: SubmitButtonProps) => {
  const { edition, readOnly, sectionNumber } = useFormPropsContext();
  const { submitForm } = useFormStateContext();
  const [buttonLoading, setButtonLoading] = useState(false);

  const { intlId, path, type } = props;

  const isFinished =
    sectionNumber === edition.sections.length && type === "next";

  const sectionName = <T token={intlId} />;
  const contents = (
    <>
      <span className="sr-only">
        <T token={`general.${type}_section`} />
      </span>
      {type === "previous" ? (
        <>
          <span aria-hidden>«</span> {sectionName}
        </>
      ) : (
        <>
          {sectionName} <span aria-hidden>»</span>
        </>
      )}
    </>
  );

  return (
    <div className={`form-btn form-btn-${type}`}>
      {readOnly ? (
        // @ts-ignore
        <Link href={path} className="btn btn-primary">
          {contents}
        </Link>
      ) : (
        <LoadingButton
          title={path}
          type="submit"
          loading={buttonLoading}
          variant="primary"
          onClick={async (e) => {
            e.preventDefault();
            await submitForm({
              path,
              beforeSubmitCallback: () => {
                setButtonLoading(true);
              },
              afterSubmitCallback: () => {
                setButtonLoading(false);
              },
              isFinished,
            });
          }}
        >
          {contents}
        </LoadingButton>
      )}
    </div>
  );
};

export default FormSubmit;
