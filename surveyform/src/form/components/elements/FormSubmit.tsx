"use client";
import { useFormContext } from "@devographics/react-form";
import { useEffect } from "react";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { useRouter } from "next/navigation";
import { LoadingButton } from "~/core/components/ui/LoadingButton";
import { captureException } from "@sentry/nextjs";
import { saveSurvey } from "~/surveys/components/page/services";
import { getEditionSectionPath } from "~/surveys/helpers";
import { useResponse } from "~/surveys/components/ResponseContext/ResponseProvider";
import { SectionMetadata } from "@devographics/types";
import { useEdition } from "~/surveys/components/SurveyContext/Provider";
import Link from "next/link";

const FormSubmit = ({
  // response,
  sectionNumber,
  nextSection,
  previousSection,
  showMessage = true,
  variant = "bottom",
  readOnly,
  prevLoading,
  setPrevLoading,
  nextLoading,
  setNextLoading,
}: {
  nextSection?: SectionMetadata;
  prevSection?: SectionMetadata;
} & any) => {
  const { edition, editionPathSegments } = useEdition();
  const router = useRouter();
  const formContext = useFormContext();
  const { getDocument, currentValues } = formContext;
  const response = useResponse();

  const pathProps = { readOnly, edition, response, editionPathSegments };
  const nextPath = nextSection
    ? getEditionSectionPath({
        ...pathProps,
        number: sectionNumber + 1,
      })
    : getEditionSectionPath({
        ...pathProps,
        page: "thanks",
      });

  useEffect(() => {
    // Prefetch the next page
    router.prefetch(nextPath);
  }, []);

  const commonProps = {
    readOnly,
    prevLoading,
    setPrevLoading,
    nextLoading,
    setNextLoading,
    survey: edition,
    response,
    sectionNumber,
    getDocument,
    currentValues,
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
  intlId: string;
  prevLoading: boolean;
  setPrevLoading: any;
  nextLoading: boolean;
  setNextLoading: boolean;
  path: string;
  type: any;
  readOnly: boolean;
  survey: any;
  // TODO: get from form contenxt?
  getDocument: any;
  currentValues: any;
}) => {
  const router = useRouter();

  const {
    intlId,
    prevLoading,
    setPrevLoading,
    nextLoading,
    setNextLoading,
    path,
    type,
    readOnly,
    survey,
    getDocument,
    currentValues,
  } = props;

  const loading = type === "next" ? nextLoading : prevLoading;
  const setLoading = type === "next" ? setNextLoading : setPrevLoading;

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

  const document = getDocument();

  return (
    <div className={`form-btn form-btn-${type}`}>
      {readOnly ? (
        <Link href={path}>{contents}</Link>
      ) : (
        <LoadingButton
          title={path}
          type="submit"
          loading={loading}
          variant="primary"
          onClick={async (e) => {
            e.preventDefault();
            setLoading(true);
            const res = await saveSurvey(survey, {
              id: document._id,
              data: currentValues,
            });
            if (res.error) {
              console.error(res.error);
              captureException(res.error);
            }
            setLoading(false);
            router.push(path);
          }}
          //{...props}
        >
          {contents}
        </LoadingButton>
      )}
    </div>
  );
};

export default FormSubmit;
