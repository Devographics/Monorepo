import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import Accordion from "react-bootstrap/Accordion";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useIntlContext } from "@vulcanjs/react-i18n";

const items = [
  // "create_account",
  // "anonymous_survey",
  "questions_required",
  "data_published",
  "survey_design",
  "results_released",
  "team",
];

const Faq = () => {
  const Components = useVulcanComponents();
  return (
    <div className="faq survey-page-block">
      <h3 className="faq-heading survey-page-block-heading">
        <Components.FormattedMessage id="general.faq" />
      </h3>
      <Accordion flush className="faq-contents">
        {items.map((item, index) => (
          <FaqItem item={item} index={index} key={item} />
        ))}
      </Accordion>
    </div>
  );
};

const FaqItem = ({ item, index }) => {
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  return (
    <Accordion.Item as="dl" eventKey={index} className="faq-item">
      <Accordion.Header as="dt" className="faq-item-heading">
        <Components.FormattedMessage id={`faq.${item}`} />
      </Accordion.Header>
      <Accordion.Body as="dd" className="faq-item-body">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {intl.formatMessage({ id: `faq.${item}.description` })}
        </ReactMarkdown>
        {/* <Components.FormattedMessage id={`faq.${item}.description`} md={true} /> */}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default Faq;
