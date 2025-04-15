import { T, useI18n } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "~/lib/i18n/survey";
import { SectionMetadata } from "@devographics/types";
import { FormItemProps } from "./Item";

export const FormItemNote = (
  props: FormItemProps & { section: SectionMetadata }
) => {
  const { t } = useI18n();
  const intlIds = getQuestioni18nIds({ ...props });
  const note = t(intlIds.note);
  return note ? <T className="form-note" token={intlIds.note} /> : null;
};
