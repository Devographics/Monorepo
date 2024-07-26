import { T } from "@devographics/react-i18n";
import { SectionMetadata } from "@devographics/types";

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
