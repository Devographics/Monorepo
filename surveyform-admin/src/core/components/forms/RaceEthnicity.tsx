import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { useVulcanComponents } from "@vulcanjs/react-ui";

const disallowedCountries = ["FR", "GF", "TF", "PF"];

export const RaceEthnicity = (props) => {
  const Components = useVulcanComponents();
  const { document, path } = props;
  const countryFieldPath = path.replace("race_ethnicity__choices", "country");
  const isDisabled =
    document[countryFieldPath] &&
    disallowedCountries.includes(document[countryFieldPath]);
  if (isDisabled) {
    props.inputProperties.disabled = true;
  }
  return (
    <div className="form-race-ethnicity">
      {isDisabled && (
        <div className="form-race-ethnicity-not-allowed">
          <Components.FormattedMessage id="user_info.race_ethnicity.not_allowed"/>
        </div>
      )}
      <Components.FormComponentCheckboxGroup {...props} />
    </div>
  );
};

export default RaceEthnicity;
