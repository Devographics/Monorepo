"use client";
import React, { useRef, useState /*, { useState }*/ } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";

/**
 * In an array of input with auto-deletion of empty inputs,
 * each input must be associated with a key to become an entity
 */
interface Item {
  value: string;
  key: string;
}

function toStrings(items: Array<Item>): Array<string> {
  return items.map(({ value }) => value);
}

function makeItem(value: string): Item {
  return { value, key: Math.random() + "" };
}

const itemId = (item: Item) => `textlist-item-${item.key}`;
const itemSelector = (item: Item) => `[data-id="${itemId(item)}"]`;
const selectItem = (wrapper: Element | undefined | null, item: Item) => {
  const maybeItem = wrapper?.querySelector(itemSelector(item));
  if (maybeItem instanceof HTMLElement) {
    return maybeItem;
  }
};

/**
 * A list of multiple text inputs (or textarea if long=true)
 *
 * Create additional items as user add values
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
    question,
    updateCurrentValues,
    readOnly,
  } = props;
  // TODO: path is undefined, perhaps because "textlist" is not yet supported by the API?
  // console.log("TEXTLIST", { path, question });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const values = value_ || [];

  // TODO: check that the key is correctly set based on "value"
  // @see https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
  const [items, setItems] = useState<Array<Item>>(values.map(makeItem));

  const [lastItem, setLastItem] = useState(makeItem(""));

  // TODO: assess if debouncing is really needed here, onchange is fired only on focus loss
  // (contrary to "oninput" which actually needs debouncing)
  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);

  const handleChange = (items: Array<Item>) => {
    setItems(items);
    updateCurrentValuesDebounced({ [path]: toStrings(items) });
  };

  const addItem = (item: Item) => {
    handleChange([...items, item]);
    // we need a new last item
    setLastItem(makeItem(""));
  };
  const removeItem = (idx: number) => {
    handleChange([...items.slice(0, idx), ...items.slice(idx + 1)]);
    // TODO: should we remove the value if the array becomes totally empty?
    // by setting it to "null"?
  };
  const updateItem = (idx: number, value: string) => {
    handleChange([
      ...items.slice(0, idx),
      { value, key: items[idx].key },
      ...items.slice(idx + 1),
    ]);
  };
  const handleBlurDebounced = (
    idx: number,
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> // onBlur
  ) => {
    const value = event.target.value;
    if (!value) {
      removeItem(idx);
    } /*else if (idx >= items.length) {
      addItem(value);
    }*/ else {
      updateItem(idx, value);
    }
  };

  return (
    <FormItem {...props} ref={wrapperRef}>
      {[...items, lastItem].map((item, idx) => {
        return (
          <FormControl
            // boostrap ain't happy with id, we just need a way to select the input imperatively to handle focus
            data-id={itemId(item)}
            style={{
              marginTop: "4px",
              marginBottom: "4px",
            }}
            key={item.key}
            as={question.longText ? "textarea" : "input"}
            defaultValue={item.value}
            onBlur={(evt) => handleBlurDebounced(idx, evt)}
            onChange={(evt) => {
              // The last item is displayed but not yet saved in the items list
              const isLastItem = idx >= items.length;
              // if we start filling the last item,
              // actually add it to the items array
              // /!\ key must stay the same to avoid visual focus jumps
              const value = evt.target.value;
              if (isLastItem) {
                if (value) {
                  addItem({ value, key: item.key });
                }
              }
              if (!value && idx > 0) {
                console.log("IDX", idx, items[idx - 1]);
                selectItem(wrapperRef.current, items[idx - 1])?.focus();
              } else if (!value && idx === 0 && items.length === 1) {
                // Deleted all content of the first input, while there is a second one
                // => focus on next item
                selectItem(wrapperRef.current, lastItem)?.focus();
              }
            }}
            onKeyUp={(evt) => {
              if (evt.key === "Enter") {
                // TODO: focus on the next input (unless we are in the last one)
                // but only if "long" is false (in textarea we want enter to add a new line instead
                // double check the mockups for the interactions)
                // TODO: we may need to check if current input is still empty or not,
                // as the focus loss and change event may happen AFTER the keyup
                // Perhaps we should use "oninput" instead of onchange
              } else if (evt.key === "ArrowUp") {
                // TODO: focus on input just above
              } else if (evt.key === "ArrowDown") {
                // TODO: focus on input just below
              }
            }}
            disabled={readOnly}
          />
        );
      })}
    </FormItem>
  );
};
