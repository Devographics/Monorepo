"use client";
import { useIntlContext } from "@devographics/react-i18n";
import { FormItemProps } from "../form/FormItem";
import { PlusIcon } from "~/components/icons";
import { useQuestionTitle } from "~/lib/surveys/helpers";

export const AddToList = (props: FormItemProps) => {
  const { updateCurrentValues, section, question, response, addMessage } =
    props;
  const readingList = response?.readingList || [];
  const { clean: label } = useQuestionTitle({ section, question });

  return (
    <div className="add-to-list">
      <PlusIcon
        labelId="readinglist.add_to_list"
        enableTooltip={true}
        isButton={true}
        onClick={() => {
          if (!readingList.includes(question.id)) {
            updateCurrentValues({ readingList: [...readingList, question.id] });
            addMessage({
              type: "success",
              bodyId: "readinglist.added_to_list",
              bodyValues: { label },
            });
          }
        }}
      />
    </div>
  );
};

export default AddToList;
