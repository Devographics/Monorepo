"use client";
import React, { useRef, useState, RefObject /*, { useState }*/ } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";
import { useIntlContext } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "@devographics/i18n";

/**
 * In an array of input with auto-deletion of empty inputs,
 * each input must be associated with a key to become an entity
 */
interface Item {
  value: string;
  key: string;
  // focus when the input is insereted
  autofocus?: boolean;
}

function toStrings(items: Array<Item>): Array<string> {
  return items.map(({ value }) => value);
}

const itemId = (item: Item) => `textlist-item-${item.key}`;
const itemSelector = (item: Item) => `[data-id="${itemId(item)}"]`;
const selectItem = (
  wrapper: Element | undefined | null,
  item: Item
): HTMLInputElement | null | undefined => {
  const maybeItem = wrapper?.querySelector(itemSelector(item));
  if (!maybeItem) console.warn(`Item ${item.key}:${item.value} not found`);
  if (maybeItem instanceof HTMLInputElement) {
    return maybeItem;
  }
};

const focusInputEnd = (maybeInput: HTMLInputElement | null | undefined) => {
  if (!maybeInput) return;
  maybeInput.focus();
  if (maybeInput.value?.length) {
    maybeInput.setSelectionRange(
      maybeInput.value.length,
      maybeInput.value.length
    ); // hack to force focusing at the end
  }
};

/**
 * Return a unique value on each call of the next function
 * (Math.Random is not suited as it can create SSR discrepencies)
 */
const useUniqueSeq = () => {
  const seqRef = useRef(0);
  return function next() {
    seqRef.current++;
    return seqRef.current;
  };
};

const DEFAULT_LIMIT = 10;

/**
 * A list of multiple text inputs (or textarea if long=true)
 *
 * "limit" options sets a limit (default is 10 responses)
 * "longText" option uses textarea instead of inputs
 *
 * TODO: we have a logic that maintains an additional "lastItem"
 * We could instead accept empty inputs in between values, this is what is preferred in the mockup
 * For instance Enter would create new input and focus on it, unless there is already an empty input below,
 * or current input is itself empty?
 *
 * TODO: check mockup https://github.com/LeaVerou/stateof/tree/main/mocks/custom-options
 * TODO: see arrays from Vulcan: https://github.com/VulcanJS/vulcan-npm/tree/main/packages/react-ui-lite/components/form/nested
 *
 * Components are defined here: surveyform/src/lib/customComponents.ts
 * @param props
 * @returns
 */
export const TextList = (props: FormInputProps<Array<string>>) => {
  const {
    path,
    value: value_,
    section,
    question,
    updateCurrentValues,
    readOnly,
  } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getUniqueKey = useUniqueSeq();
  // guarantee a unique key
  function makeItem(value: string, autofocus?: boolean): Item {
    return { value, key: getUniqueKey() + "", autofocus };
  }

  // TODO: check that the key is correctly set based on "value"
  // @see https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
  const values = value_ || [];

  // NOTE: current code doesn't accept concurrent updates of this value,
  // either use a reducer or "functional" setState
  const [items, setItems] = useState<Array<Item>>(
    values.map((val) => makeItem(val))
  );

  const [lastItem, setLastItem] = useState(makeItem(""));

  // Values update
  // TODO: assess if debouncing is really needed here, onchange is fired only on focus loss
  // (contrary to "oninput" which actually needs debouncing)
  // it seems that React Bootstrap treats onChange as onInput
  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);
  const updateAllItems = (items: Array<Item>) => {
    setItems(items);
    updateCurrentValuesDebounced({ [path]: toStrings(items) });
  };
  const limit = question.limit || DEFAULT_LIMIT;
  /**
   * If no index is provided, add a last item
   */
  const addLastItem = (item: Item) => {
    updateAllItems([...items, item]);
    // we need a new last item
    setLastItem(makeItem(""));
  };
  const addItem = (item: Item, index: number) => {
    updateAllItems([...items.slice(0, index), item, ...items.slice(index)]);
  };
  const removeItem = (idx: number) => {
    updateAllItems([...items.slice(0, idx), ...items.slice(idx + 1)]);
    // TODO: should we remove the value if the array becomes totally empty?
    // by setting it to "null"?
  };
  const updateItem = (idx: number, value: string) => {
    updateAllItems([
      ...items.slice(0, idx),
      { value, key: items[idx].key },
      ...items.slice(idx + 1),
    ]);
  };

  // Focus management
  const selectPreviousItem = (index: number) =>
    //previous item is necessarily an existing item
    selectItem(wrapperRef.current, items[index - 1]);
  const selectLastItem = () => selectItem(wrapperRef.current, lastItem);
  const selectNextItem = (index: number) => {
    if (index === items.length - 1) {
      return selectLastItem();
    }
    return selectItem(wrapperRef.current, items[index + 1]);
  };

  const onItemBlur = (
    index: number,
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> // onBlur
  ) => {
    const value = event.target.value;
    if (!value) {
      if (index <= items.length - 1) removeItem(index);
    } else if (value !== items[index].value) {
      // only update if the item actually changed otherwise we have competing updates
      updateItem(index, value);
    }
  };

  const onItemChange = (index: number, key: string, evt) => {
    // The last item is displayed but not yet saved in the items list
    const isLastItem = index >= items.length;
    const value = evt.target.value;
    // if we start filling the last item,
    // add this item to the actual items,
    // and create a new last item
    if (isLastItem) {
      if (value && items.length <= limit) {
        addLastItem({ value, key });
      }
    }
  };
  const onItemKeyDown = (
    index: number,
    evt: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // @ts-ignore TODO: not sure why we don't have a value despite using an HTMLInputElement
    const value: string = evt.target.value;
    if (evt.key === "Enter") {
      // Leave textarea behaviour alone
      if (question.longText) return;
      // Pressing enter when focusing on an empty last item => submit the form as usual
      // (last item is always empty, sinc starting to type in it will create a new empty last item)
      if (index === items.length) return;
      // prevent form submission
      evt.stopPropagation();
      evt.preventDefault();
      // Create an empty item next OR focus on existing one
      const nextItem = selectNextItem(index);
      if (!nextItem) return; // should not happen but pleases TS
      if (!value) {
        // no current value => focus on next item
        // the blur event will take care of removing the current input
        nextItem.focus();
      } else if (!nextItem.value) {
        // next item is already empty, just focus on it
        nextItem.focus();
      } else if (items.length >= limit) {
        // already too many items
        nextItem.focus();
      } else {
        // create a new empty item at next index
        // it will use autofocus
        const newItem = makeItem("", true);
        addItem(newItem, index + 1);
      }
    } else if (evt.key === "ArrowUp") {
      if (index > 0) {
        evt.preventDefault();
        focusInputEnd(selectPreviousItem(index));
      }
    } else if (evt.key === "ArrowDown") {
      if (index < items.length) {
        evt.preventDefault();
        focusInputEnd(selectNextItem(index));
      }
    } else if (evt.key === "Backspace" || evt.key === "Delete") {
      // let the input handle deletion if there are chars to delete
      if (value.length > 0) return;
      // if there is only one last char before deletion, remove the item and focus on next one
      evt.preventDefault();
      if (index === items.length) {
        // we are in the last item, if possible focus on previous one
        if (index > 0) {
          focusInputEnd(selectPreviousItem(index));
        }
      } else if (index > 0) {
        // we are in the middle (not last item, but there is a previous item)
        focusInputEnd(selectPreviousItem(index));
        removeItem(index);
      } else if (items.length > 0) {
        // there are no previous item, but there is a next one
        focusInputEnd(selectNextItem(0));
        removeItem(index);
      }
    }
  };

  const itemProps = {
    section,
    question,
    items,
    readOnly,
    wrapperRef,
    lastItem,
  };

  const allItems = items.length < limit ? [...items, lastItem] : items;

  return (
    <FormItem {...props} ref={wrapperRef}>
      {allItems.map((item, index) => (
        <TextListItem
          key={item.key}
          {...itemProps}
          index={index}
          item={item}
          onBlur={(evt) => onItemBlur(index, evt)}
          onChange={(evt) => onItemChange(index, item.key, evt)}
          onKeyDown={(evt) => onItemKeyDown(index, evt)}
        />
      ))}
    </FormItem>
  );
};

const TextListItem = ({
  section,
  question,
  item,
  index,
  readOnly,
  onBlur,
  onChange,
  onKeyDown,
}: {
  section: FormInputProps["section"];
  question: FormInputProps["question"];
  item: Item;
  index: number;
  readOnly?: boolean;
  onBlur: React.EventHandler<
    React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  >;
  onChange: React.EventHandler<
    React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  >;
  onKeyDown: React.EventHandler<
    React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  >;
}) => {
  const { formatMessage } = useIntlContext();

  const defaultPlaceholder = formatMessage({
    id: "textlist.placeholder",
    values: { index: index + 1 },
  });
  const i18n = getQuestioni18nIds({ section, question });

  const questionPlaceholder = formatMessage({
    id: `${i18n.base}.placeholder`,
    values: { index: index + 1 },
  });

  const placeholder = questionPlaceholder || defaultPlaceholder;

  console.log(i18n.base);
  console.log(questionPlaceholder);
  console.log(defaultPlaceholder);
  return (
    <FormControl
      // id={itemId(item)}
      // boostrap ain't happy with id, we just need a way to select the input imperatively to handle focus
      data-id={itemId(item)}
      style={{
        marginTop: "4px",
        marginBottom: "4px",
      }}
      // TODO: use different templates to simplify?
      as={question.longText ? "textarea" : "input"}
      placeholder={placeholder}
      defaultValue={item.value}
      //value={localValue}
      //onChange={(evt) => handleChangeDebounced(idx, evt)}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={readOnly}
      autoFocus={item.autofocus}
    />
  );
};
