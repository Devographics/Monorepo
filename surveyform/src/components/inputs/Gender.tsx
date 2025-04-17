import { T } from "@devographics/react-i18n";
import { FormInputProps } from "../form/typings";
import { FormComponentRadioGroup } from "./Radiogroup";

export const Gender = (props: FormInputProps<string>) => {
  const { value, edition } = props;
  const { questionsUrl } = edition;
  const snowballLink = `${questionsUrl}?source=referral_5n0w`;
  const handleFocus = (event) => event.target.select();

  return (
    <div className="form-gender">
      <FormComponentRadioGroup {...props} />
      {value === "female" && (
        <div className="snowball-sampling-note">
          <T token="user_info.gender.snowball_sampling" />
          <input
            type="text"
            defaultValue={snowballLink}
            onFocus={handleFocus}
          />
        </div>
      )}
    </div>
  );
};

export default Gender;
