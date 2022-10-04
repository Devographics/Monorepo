import React from "react";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

const SurveySectionHeading = ({ section, sectionNumber, survey }) => {
  const { id, intlId } = section;

  return (
    <div className="section-heading">
      <h2 className="section-title">
        <span className="section-title-pagenumber">
          {sectionNumber}/{survey.outline.length}
        </span>
        <FormattedMessage
          className="section-title-label"
          id={`sections.${intlId || id}.title`}
          defaultMessage={id}
          values={{ ...survey }}
        />
      </h2>
      <p className="section-description">
        <FormattedMessage
          id={`sections.${intlId || id}.description`}
          defaultMessage={id}
          values={{ ...survey }}
        />
      </p>
    </div>
  );
};

export default SurveySectionHeading;
