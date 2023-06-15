import React from "react";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getSectionKey } from "~/lib/surveys/helpers";
import QuestionLabel from "../form/QuestionLabel";

const SurveySectionHeading = ({ section, sectionNumber, edition }) => {
  const { id, intlId } = section;

  return (
    <div className="section-heading">
      <div className="section-heading-contents">
        <div className="section-heading-inner">
          <h2 className="section-title">
            <span className="section-title-pagenumber">
              {sectionNumber}/{edition.sections.length}
            </span>
            <FormattedMessage
              className="section-title-label"
              id={getSectionKey(section, "title")}
              defaultMessage={id}
              values={{ ...edition }}
            />
          </h2>
          <p className="section-description">
            <FormattedMessage
              id={getSectionKey(section, "description")}
              defaultMessage={id}
              values={{ ...edition }}
            />
          </p>
        </div>
        <div className="section-toc">
          <ol>
            {section.questions.map((question) => (
              <QuestionItem
                key={question.id}
                section={section}
                question={question}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

const QuestionItem = ({ section, question }) => {
  return (
    <li>
      <a href={`#${question.id}`}>
        <QuestionLabel
          section={section}
          question={question}
          formatCode={false}
        />
      </a>
    </li>
  );
};

export default SurveySectionHeading;
