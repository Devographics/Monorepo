"use client";
import { useEffect } from "react";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { useRouter } from "next/navigation";
import { LoadingButton } from "~/components/ui/LoadingButton";
import { getEditionSectionPath } from "~/lib/surveys/helpers/getEditionSectionPath";
import { SectionMetadata } from "@devographics/types";
import { useEdition } from "~/components/SurveyContext/Provider";
import Link from "next/link";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { useState } from "react";
import { FormInputProps } from "./typings";
import Button from "react-bootstrap/esm/Button";
import { getSectioni18nIds } from "~/i18n/survey";
import { FormLayoutProps } from "./FormLayout";

interface FormSubmitProps extends FormLayoutProps {
  path: string;
  sectionNumber: number;
  nextSection: SectionMetadata;
  previousSection: SectionMetadata;
}

export const FormSubmit = (props: FormLayoutProps) => {
  const { response, sectionNumber, nextSection, previousSection, readOnly } =
    props;

  const { locale } = useLocaleContext();
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
            intlId={getSectioni18nIds({ section: nextSection }).title}
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
            intlId={getSectioni18nIds({ section: previousSection }).title}
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
  const [buttonLoading, setButtonLoading] = useState(false);

  const { edition, sectionNumber, intlId, path, type, readOnly, submitForm } =
    props;

  const isFinished =
    sectionNumber === edition.sections.length && type === "next";

  const sectionName = <FormattedMessage id={intlId} defaultMessage={intlId} />;
  const contents = (
    <>
      <span className="sr-only">
        <FormattedMessage id={`general.${type}_section`} />
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
        <Button as={Link} href={path}>
          {contents}
        </Button>
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
