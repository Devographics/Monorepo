import React from "react";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import FormComponentCheckboxGroup from "./Checkboxgroup";
import { FormInputProps } from "../form/typings";
import { useFormStateContext } from "../form/FormStateContext";

const disallowedCountries = ["FRA", "GUF", "ATF", "PYF"];

export const RaceEthnicity = (props: FormInputProps<string[]>) => {
  const { path } = props;
  const { response } = useFormStateContext();
  let checkboxProps = props;
  const countryFieldPath = path.replace("race_ethnicity__choices", "country");
  const isDisabled =
    response &&
    response[countryFieldPath] &&
    disallowedCountries.includes(response[countryFieldPath]);
  if (isDisabled) {
    checkboxProps = { ...checkboxProps, readOnly: true };
  }
  return (
    <div className="form-race-ethnicity">
      {isDisabled && (
        <div className="form-race-ethnicity-not-allowed">
          <FormattedMessage id="user_info.race_ethnicity.not_allowed" />
        </div>
      )}
      <FormComponentCheckboxGroup {...checkboxProps} />
    </div>
  );
};

export default RaceEthnicity;
