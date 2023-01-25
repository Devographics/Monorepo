import React from "react";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { getSectionKey } from "~/surveys/helpers";

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
          id={getSectionKey(section, "title")}
          defaultMessage={id}
          values={{ ...survey }}
        />
      </h2>
      <p className="section-description">
        <FormattedMessage
          id={getSectionKey(section, "description")}
          defaultMessage={id}
          values={{ ...survey }}
        />
      </p>
    </div>
  );
};

export default SurveySectionHeading;
