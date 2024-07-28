import { SectionMetadata } from "@devographics/types";
import { T } from "@devographics/react-i18n";

export const FormSectionMessage = ({
  section,
}: {
  section: SectionMetadata;
}) => {
  return (
    <div className="form-section-message form-help">
      <T token={section.messageId!} />
    </div>
  );
};

export default FormSectionMessage;
