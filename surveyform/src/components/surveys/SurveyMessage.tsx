import { FormattedMessage } from "~/components/common/FormattedMessage";
import { EditionMetadata } from "@devographics/types";
import { SurveyStatusEnum } from "@devographics/types";

const EditionMessage = ({ edition }: { edition: EditionMetadata }) => {
  const { status } = edition;
  switch (status) {
    default:
      return null;
  }
};

export default EditionMessage;
