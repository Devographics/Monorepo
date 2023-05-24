"use client";
import { FormItemProps } from "../form/FormItem";
import { PlusIcon } from "~/components/icons";

export const AddToList = (props: FormItemProps) => {
  const { updateCurrentValues, question, response } = props;
  const readingList = response.readingList || [];
  return (
    <div className="add-to-list">
      <PlusIcon
        labelId="readinglist.add_to_list"
        enableTooltip={true}
        isButton={true}
        onClick={() => {
          if (!readingList.includes(question.id)) {
            updateCurrentValues({ readingList: [...readingList, question.id] });
          }
        }}
      />
    </div>
  );
};

export default AddToList;
