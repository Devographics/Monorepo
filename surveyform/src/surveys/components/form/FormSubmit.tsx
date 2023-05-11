"use client";
import { useEffect } from "react";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { useRouter } from "next/navigation";
import { LoadingButton } from "~/core/components/ui/LoadingButton";
import { getEditionSectionPath } from "~/surveys/helpers";
import { EditionMetadata, SectionMetadata } from "@devographics/types";
import { useEdition } from "~/surveys/components/SurveyContext/Provider";
import Link from "next/link";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { ResponseDocument } from "@devographics/core-models";
import { useState } from "react";

export const FormSubmit = ({
  response,
  sectionNumber,
  nextSection,
  previousSection,
  showMessage = true,
  variant = "bottom",
  readOnly,
  stateStuff,
}: {
  response: ResponseDocument;
  sectionNumber: number;
  nextSection?: SectionMetadata;
  previousSection?: SectionMetadata;
  showMessage: boolean;
  variant: "bottom" | "top";
  readOnly: boolean;
  stateStuff: any;
}) => {
  const { locale } = useLocaleContext();
  const { edition, editionPathSegments } = useEdition();
  const router = useRouter();

  const pathProps = { readOnly, edition, response, editionPathSegments };
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

  const commonProps = {
    response,
    readOnly,
    stateStuff,
    edition,
    sectionNumber,
  };

  return (
    <div className={`form-submit form-section-nav form-section-nav-${variant}`}>
      <div className="form-submit-actions">
        {nextSection ? (
          <SubmitButton
            {...commonProps}
            type="next"
            intlId={`sections.${nextSection.intlId || nextSection.id}.title`}
            path={nextPath}
          />
        ) : (
          <SubmitButton
            {...commonProps}
            type="next"
            intlId="general.finish_survey"
            path={nextPath}
          />
        )}
        {previousSection ? (
          <SubmitButton
            {...commonProps}
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

      {showMessage && (
        <div className="form-submit-help">
          <FormattedMessage id="general.data_is_saved" />
        </div>
      )}
    </div>
  );
};

const SubmitButton = (props: {
  response: ResponseDocument;
  intlId: string;
  stateStuff: any;
  path: string;
  type: any;
  readOnly: boolean;
  edition: EditionMetadata;
}) => {
  const [buttonLoading, setButtonLoading] = useState(false);

  const { response, intlId, path, type, readOnly, edition, stateStuff } = props;
  const { submitForm } = stateStuff;

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
        <Link href={path}>{contents}</Link>
      ) : (
        <LoadingButton
          title={path}
          type="submit"
          loading={buttonLoading}
          variant="primary"
          onClick={async (e) => {
            e.preventDefault();
            await submitForm({ path, setButtonLoading });
          }}
        >
          {contents}
        </LoadingButton>
      )}
    </div>
  );
};

export default FormSubmit;
