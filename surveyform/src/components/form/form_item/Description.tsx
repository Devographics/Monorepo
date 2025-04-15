import { T } from "@devographics/react-i18n";
import { FormItemProps } from "./Item";
import { useI18n } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "~/lib/i18n/survey";

import { SectionMetadata } from "@devographics/types";
export const FormItemDescription = (
  props: FormItemProps & { section: SectionMetadata }
) => {
  const { question } = props;
  const { entity } = question;
  const { t, getMessage } = useI18n();
  const intlIds = getQuestioni18nIds(props);
  const i18nDescription = getMessage(intlIds.description);
  const i18nPrompt = getMessage(intlIds.prompt);

  const entityDescription = entity?.descriptionHtml || entity?.descriptionClean;

  // we don't need to show description for libraries since it's just
  // a matter of whether you recognize the name or not
  const showDescription =
    entityDescription && !entity?.tags?.includes("libraries");
  if (
    i18nDescription &&
    !i18nDescription.missing //.type !== TokenType.KEY_FALLBACK
  ) {
    return (
      <div className="form-item-description">
        <T token={intlIds.description} />
      </div>
    );
  } else if (showDescription) {
    return (
      <p className="form-item-description">
        <span
          dangerouslySetInnerHTML={{
            __html: entityDescription,
          }}
        />
      </p>
    );
  } else {
    return null;
  }
};
