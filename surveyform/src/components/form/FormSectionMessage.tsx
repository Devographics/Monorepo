import { FormattedMessage } from "../common/FormattedMessage";
import { SectionMetadata } from "@devographics/types";

export const FormSectionMessage = ({
  section,
}: {
  section: SectionMetadata;
}) => {
  return (
    <div className="form-section-message form-help">
      <FormattedMessage id={section.messageId!} />
    </div>
  );
};

export default FormSectionMessage;
