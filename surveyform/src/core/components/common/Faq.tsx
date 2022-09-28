import React from "react";
// import Accordion from "react-bootstrap/Accordion";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useIntlContext } from "@vulcanjs/react-i18n";

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

const Faq = ({ survey }) => {
  const Components = useVulcanComponents();
  const items = survey.faq || defaultItems;
  return (
    <div className="faq survey-page-block">
      <h3 className="faq-heading survey-page-block-heading">
        <Components.FormattedMessage id="general.faq" />
      </h3>
      <div className="faq-contents">
        {items.map((item, index) => (
          <FaqItem item={item} index={index} key={item} />
        ))}
      </div>
    </div>
  );
};

const FaqItem = ({ item, index }) => {
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  return (
    <dl className="faq-item">
      <dt className="faq-item-heading">
        <Components.FormattedMessage id={`faq.${item}`} />
      </dt>
      <dd className="faq-item-body">
        {/* <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {intl.formatMessage({ id: `faq.${item}.description` })}
        </ReactMarkdown> */}
        <Components.FormattedMessage
          id={`faq.${item}.description`}
          html={true}
        />
      </dd>
    </dl>
  );
};

export default Faq;
