import React from "react";
import { DynamicT } from "@devographics/react-i18n";

const defaultItems = [
  // "create_account",
  // "anonymous_survey",
  "questions_required",
  "data_used",
  "survey_design",
  "results_released",
  "team",
  "learn_more",
];

const Faq = ({ edition }) => {
  const items = edition.faq;
  return items ? (
    <div className="faq survey-page-block">
      <h3 className="faq-heading survey-page-block-heading">
        <DynamicT token="general.faq" />
      </h3>
      <div className="faq-contents">
        {items.map((item, index) => (
          <FaqItem item={item} index={index} key={item} />
        ))}
      </div>
    </div>
  ) : null;
};

const FaqItem = ({ item, index }) => {
  return (
    <dl className="faq-item">
      <dt className="faq-item-heading">
        {/**
         * If we need to make it a client component,
         * we can use a token expression to select only the relevant i18n tokens
         * "faq.[*]"" and "faq.[*].description"
         */}
        <DynamicT token={`faq.${item}`} />
      </dt>
      <dd className="faq-item-body">
        <DynamicT token={`faq.${item}.description`} />
      </dd>
    </dl>
  );
};

export default Faq;
