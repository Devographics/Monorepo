import React from "react";
import EntityLabel from "~/core/components/common/EntityLabel";
import { FormInputProps } from "~/surveys/components/form/typings";
import { OptionMetadata } from "@devographics/types";
import { useIntlContext } from "@devographics/react-i18n";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

interface FormOptionProps extends FormInputProps {
  option: OptionMetadata;
}

export const FormOption = ({ question, option }: FormOptionProps) => {
  const { entity } = option;
  const intl = useIntlContext();
  const intlId = `options.${question.id}.${option.id}`;
  const descriptionIntlId = `${intlId}.description`;
  const optionDescription = intl.formatMessage({
    id: descriptionIntlId,
  });

  return (
    <div className="form-option">
      <span className="form-option-label">
        {entity ? (
          <EntityLabel entity={entity} />
        ) : (
          <FormattedMessage id={intlId} />
        )}
      </span>

      {optionDescription && (
        <FormattedMessage
          className="form-option-description"
          id={descriptionIntlId}
        />
      )}
    </div>
  );
};

export default FormOption;
