import React from "react";
import { FormattedMessage } from "../common/FormattedMessage";

const disallowedCountries = ["FR", "GF", "TF", "PF"];

const Components = {
  FormComponentCheckboxGroup: () => <div>todo</div>,
};

export const RaceEthnicity = (props) => {
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
          <FormattedMessage id="user_info.race_ethnicity.not_allowed" />
        </div>
      )}
      <Components.FormComponentCheckboxGroup {...props} />
    </div>
  );
};

export default RaceEthnicity;
