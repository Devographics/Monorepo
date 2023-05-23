"use client";
import { useEffect } from "react";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { useRouter } from "next/navigation";
import { LoadingButton } from "~/components/ui/LoadingButton";
import { getEditionSectionPath } from "~/lib/surveys/helpers";
import { SectionMetadata } from "@devographics/types";
import { useEdition } from "~/components/SurveyContext/Provider";
import Link from "next/link";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { useState } from "react";
import { FormInputProps } from "./typings";
import Button from "react-bootstrap/esm/Button";

interface FormSubmitProps extends FormInputProps {
  sectionNumber: number;
  nextSection: SectionMetadata;
  previousSection: SectionMetadata;
}

export const FormSubmit = (props: FormSubmitProps) => {
  const {
    response,
    sectionNumber,
    nextSection,
    previousSection,
    // showMessage = true,
    readOnly,
    submitForm,
  } = props;

  const { locale } = useLocaleContext();
  const { edition } = useEdition();
  const router = useRouter();

  const pathProps = { readOnly, edition, response };
  const nextPath = nextSection
    ? getEditionSectionPath({
        ...pathProps,
        number: sectionNumber + 1,
        locale,
      })
    : getEditionSectionPath({
        ...pathProps,
        page: "thanks",
        locale,
      });

  useEffect(() => {
    // Prefetch the next page
    router.prefetch(nextPath);
  }, []);

  return (
    <div className={`form-submit form-section-nav`}>
      <div className="form-submit-actions">
        {nextSection ? (
          <SubmitButton
            {...props}
            type="next"
            intlId={`sections.${nextSection.intlId || nextSection.id}.title`}
            path={nextPath}
          />
        ) : (
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
            intlId={`sections.${
              previousSection.intlId || previousSection.id
            }.title`}
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

      {/* {showMessage && (
        <div className="form-submit-help">
          <FormattedMessage id="general.data_is_saved" />
        </div>
      )} */}
    </div>
  );
};

interface SubmitButtonProps extends FormSubmitProps {
  intlId: string;
  type: "previous" | "next";
}

const SubmitButton = (props: SubmitButtonProps) => {
  const [buttonLoading, setButtonLoading] = useState(false);

  const { intlId, path, type, readOnly, submitForm } = props;

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
