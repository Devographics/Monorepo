import { T } from "@devographics/react-i18n";
import React from "react";
import { getQuestioni18nIds } from "~/lib/i18n/survey";

export const Help = (props) => {
  const i18n = getQuestioni18nIds(props);
  return (
    <div className="form-help">
      <T token={i18n.base} />
    </div>
  );
};

export default Help;
