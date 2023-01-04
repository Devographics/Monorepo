"use client";
/*

1. Receive submitForm callback from SmartForm
2. Call it on click
3. Once form has submitted, redirect to prev/next section

TODO

- Refactor to make DRYer

@see packages/react-ui/components/form/FormSubmit.tsx

*/
import { useFormContext } from "@vulcanjs/react-ui";
import React, { useEffect } from "react";
import { getSurveyPath } from "~/modules/surveys/getters";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { SurveyDocument } from "@devographics/core-models";
import Link from "next/link";
import { useSaveSurveyMutation } from "~/core/components/survey/questions/useSaveSurveyMutation";
import { useRouter } from "next/navigation";
import { LoadingButton } from "~/core/components/ui/LoadingButton";

const FormSubmit = ({
  survey,
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
}: { survey: SurveyDocument } & any) => {
  const router = useRouter();
  const formContext = useFormContext();
  const { getDocument, submitForm, currentValues } = formContext;
  const response = getDocument();

  const pathProps = { readOnly, survey, response };
  const nextPath = nextSection
    ? getSurveyPath({
        ...pathProps,
        number: sectionNumber + 1,
      })
    : getSurveyPath({
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
    survey,
    response,
    sectionNumber,
    submitForm,
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
            path={getSurveyPath({
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

const SubmitButton = (props) => {
  const router = useRouter();

  const {
    intlId,
    prevLoading,
    setPrevLoading,
    nextLoading,
    setNextLoading,
    path,
    submitForm,
    type,
    readOnly,
    survey,
    getDocument,
    currentValues,
  } = props;

  const loading = type === "next" ? nextLoading : prevLoading;
  const setLoading = type === "next" ? setNextLoading : setPrevLoading;

  const contents = (
    <>
      <span className="sr-only">
        <FormattedMessage id={`general.${type}_section`} />
      </span>
      {type === "previous" ? (
        <>
          <span aria-hidden>«</span> <FormattedMessage id={intlId} />
        </>
      ) : (
        <>
          <FormattedMessage id={intlId} /> <span aria-hidden>»</span>
        </>
      )}
    </>
  );

  const document = getDocument();

  const {
    saveSurvey,
    data,
    loading: saveSurveyLoading,
    error,
  } = useSaveSurveyMutation(survey);

  return (
    <div className={`form-btn form-btn-${type}`}>
      {readOnly ? (
        <Link href={path}>{contents}</Link>
      ) : (
        <LoadingButton
          type="submit"
          loading={loading}
          variant="primary"
          onClick={async (e) => {
            e.preventDefault();
            setLoading(true);
            // await submitForm();
            await saveSurvey({
              variables: { input: { id: document._id, data: currentValues } },
            });
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
