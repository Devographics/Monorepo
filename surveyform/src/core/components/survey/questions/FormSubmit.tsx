/*

1. Receive submitForm callback from SmartForm
2. Call it on click
3. Once form has submitted, redirect to prev/next section

TODO

- Refactor to make DRYer

@see packages/react-ui/components/form/FormSubmit.tsx

*/
import { useVulcanComponents, useFormContext } from "@vulcanjs/react-ui";
import { useRouter } from "next/router.js";
import React, { useState } from "react";
import { getSurveyPath } from "~/modules/surveys/getters";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { SurveyDocument } from "@devographics/core-models";
import Link from "next/link";

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
  const formContext = useFormContext();
  const { getDocument, submitForm } = formContext;
  const response = getDocument();

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
  };

  return (
    <div className={`form-submit form-section-nav form-section-nav-${variant}`}>
      <div className="form-submit-actions">
        {nextSection ? (
          <SubmitButton
            {...commonProps}
            type="next"
            intlId={`sections.${nextSection.intlId || nextSection.id}.title`}
            path={getSurveyPath({
              readOnly,
              survey,
              response,
              number: sectionNumber + 1,
            })}
          />
        ) : (
          <SubmitButton
            {...commonProps}
            type="next"
            intlId="general.finish_survey"
            path={getSurveyPath({
              readOnly,
              survey,
              response,
              page: "thanks",
            })}
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
              readOnly,
              survey,
              response,
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
  const Components = useVulcanComponents();
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

  return readOnly ? (
    <Link className={`form-btn-${type}`} href={path}>
      {contents}
    </Link>
  ) : (
    <Components.LoadingButton
      // title={intl.formatMessage({ id: `sections.${previousSection.id}.title` })}
      className={`form-btn-${type}`}
      type="submit"
      loading={loading}
      variant="primary"
      onClick={async (e) => {
        e.preventDefault();
        setLoading(true);
        await submitForm();
        setLoading(false);
        router.push(path);
      }}
      {...props}
    >
      {contents}
    </Components.LoadingButton>
  );
};

export default FormSubmit;
