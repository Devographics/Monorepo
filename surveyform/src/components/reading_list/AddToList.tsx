"use client";
import { useMessagesContext } from "../common/UserMessagesContext";
import { FormInputProps } from "../form/typings";
import { Plus, Check } from "~/components/icons";
import without from "lodash/without";

export const AddToList = (
  props: FormInputProps & { label: string; id: string | number }
) => {
  const { updateCurrentValues, label, id, response } = props;
  const readingList = response?.readingList || [];

  const { addMessage } = useMessagesContext();

  const isInList = readingList.includes(id);

  const Icon = isInList ? Check : Plus;

  const handleClick = (e) => {
    e.preventDefault();
    if (isInList) {
      updateCurrentValues({ readingList: without(readingList, id) });
    } else {
      updateCurrentValues({ readingList: [...readingList, id] });
      addMessage({
        type: "success",
        bodyId: "readinglist.added_to_list",
        bodyValues: { label },
      });
    }
  };

  const iconProps = {
    labelId: isInList
      ? "readinglist.remove_from_list"
      : "readinglist.add_to_list",
    enableTooltip: true,
    isButton: true,
    onClick: handleClick,
  };

  return (
    <div
      className={`add-to-list ${
        isInList ? "add-to-list-inList" : "add-to-list-notInlLst"
      }`}
    >
      <Icon {...iconProps} />
    </div>
  );
};

export default AddToList;
