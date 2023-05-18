import React from "react";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getSectionKey } from "~/lib/surveys/helpers";

const SurveySectionHeading = ({ section, sectionNumber, edition }) => {
  const { id, intlId } = section;

  return (
    <div className="section-heading">
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
  );
};

export default SurveySectionHeading;
