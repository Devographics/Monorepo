"use client";
import { useMessagesContext } from "../common/UserMessagesContext";
import { FormInputProps } from "../form/typings";
import { PlusIcon } from "~/components/icons";

export const AddToList = (
  props: FormInputProps & { label: string; id: string | number }
) => {
  const { updateCurrentValues, label, id, response } = props;
  const readingList = response?.readingList || [];

  const { addMessage } = useMessagesContext();

  return (
    <div className="add-to-list">
      <PlusIcon
        labelId="readinglist.add_to_list"
        enableTooltip={true}
        isButton={true}
        onClick={() => {
          if (!readingList.includes(id)) {
            updateCurrentValues({ readingList: [...readingList, id] });
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
