"use client";
import React, { useRef, useState, useEffect } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";
import { useIntlContext } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "@devographics/i18n";

// Items management

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

// Utilities

/**
 * When focusing an input the focus is at the beggining of the text
 * This function will focus at the end instead to add more content
 */
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
 * Needed to generate item keys
 */
const useUniqueSeq = () => {
  const seqRef = useRef(0);
  return function next() {
    seqRef.current++;
    return seqRef.current;
  };
};

// Config

const DEFAULT_LIMIT = 10;
// how many virtual items we want to incitate users to answer
// when there is at least one input filled, we show only 1 virtual item in any case
const INITIAL_VIRTUAL_ITEMS = 2;

// Managing an array of real and virtual values

/**
 * Manage a set of real and virtual values
 * TODO: useReducer instead of using state
 */
const useRealVirtualItems = (values: Array<string>, limit?: number) => {
  const getUniqueKey = useUniqueSeq();
  // guarantee a unique key
  function makeItem(value: string, autofocus?: boolean): Item {
    return { value, key: getUniqueKey() + "", autofocus };
  }

  // state, virtual and additional values
  const [{ items, virtualItems }, setRealVirtualItems] = useState<{
    items: Array<Item>;
    virtualItems: Array<Item>;
  }>({
    items: values.map((val) => makeItem(val)),
    virtualItems: Array(expectedNbVirtual(values.length))
      .fill(null)
      .map(() => makeItem("")),
  });
  const setItems = (cb: (items: Array<Item>) => Array<Item>) => {
    setRealVirtualItems(({ items, virtualItems }) => ({
      items: cb(items),
      virtualItems,
    }));
  };
  /*const setVirtualItems = (cb: (items: Array<Item>) => Array<Item>) => {
    setRealVirtualItems(({ items, virtualItems }) => ({
      items,
      virtualItems: cb(virtualItems),
    }));
  };*/
  function expectedNbVirtual(nbItems: number) {
    // Virtual fields incitate user to answer
    // We need only one virtual field if the user has started filling the textList
    if (nbItems >= (limit || DEFAULT_LIMIT)) return 0;
    if (nbItems) return 1;
    return INITIAL_VIRTUAL_ITEMS;
  }

  // Manage virtual items
  function refillVirtualItems() {
    setRealVirtualItems(({ items, virtualItems }) => {
      const need = expectedNbVirtual(items.length) - virtualItems.length;
      if (need <= 0) return { items, virtualItems }; // nothing to do
      return {
        items,
        virtualItems: [
          ...virtualItems,
          ...Array(need)
            .fill(null)
            .map(() => makeItem("")),
        ],
      };
    });
  }
  /**
   * Make the virtual item = add it to items,
   * remove it from virtual, and add more virtual fields if needed
   * @param item
   */
  function reifyVirtualItem(index: number, value: string) {
    setRealVirtualItems(({ items, virtualItems }) => {
      // We actually reify all virtual items BEFORE the reified one
      const reifiedItems = virtualItems.slice(0, index - items.length + 1);
      reifiedItems[index - items.length].value = value;
      return {
        items: [...items, ...reifiedItems],
        virtualItems: virtualItems.slice(index - items.length + 1), // refill is handled by a separate method,
      };
    });
    refillVirtualItems();
  }

  // Manage real items
  const createItemAt = (index: number, autofocus?: true) => {
    const item = makeItem("", autofocus);
    setItems((items) => [
      ...items.slice(0, index),
      item,
      ...items.slice(index),
    ]);
  };
  const removeItemAt = (idx: number) => {
    setItems((items) => [...items.slice(0, idx), ...items.slice(idx + 1)]);
    refillVirtualItems();
  };
  const updateItem = (idx: number, value: string) => {
    setItems((items) => [
      ...items.slice(0, idx),
      { value, key: items[idx].key },
      ...items.slice(idx + 1),
    ]);
  };

  // Getters
  /**
   * Get either virtual or real input at given index
   * @param index
   * @returns
   */
  function getItemAtIdx(index: number) {
    if (index < items.length) {
      return items[index];
    } else {
      return virtualItems[index - items.length];
    }
  }

  function setAllItems(items: Array<Item>) {
    setItems(() => items);
    refillVirtualItems();
  }

  return [
    { items, virtualItems },
    {
      getItemAtIdx,
      reifyVirtualItem,
      updateItem,
      setAllItems,
      createItemAt,
      removeItemAt,
    },
  ] as const;
};

/**
 * A list of multiple text inputs (or textarea if long=true)
 *
 * "limit" options sets a limit (default is 10 responses)
 * "longText" option uses textarea instead of inputs
 *
 * In current implementation, the underlying intpus are not controlled
 * This facilitates handling events
 * But we must be cautious to get current up to date values from the DOM
 * and not from the state
 *
 *
 * @see mockup https://github.com/LeaVerou/stateof/tree/main/mocks/custom-options
 * @see arrays from Vulcan: https://github.com/VulcanJS/vulcan-npm/tree/main/packages/react-ui-lite/components/form/nested
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

  // TODO: check that the key is correctly set based on "value"
  // @see https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
  const values = value_ || [];
  const updateValue = (items: Array<Item>) => {
    updateCurrentValuesDebounced({
      [path]: items.length ? toStrings(items) : null,
    });
  };

  const [
    { items, virtualItems },
    {
      getItemAtIdx,
      updateItem,
      setAllItems,
      reifyVirtualItem,
      createItemAt,
      removeItemAt,
    },
  ] = useRealVirtualItems(values, question.limit);

  // TODO: an effect is not usually the best approach
  useEffect(() => {
    updateValue(items);
  }, [items]);

  const removeEmptyItems = () => {
    let filtered: Array<Item> = [];
    // items state is not yet updated when we blur the whole form
    // const filtered = items.filter((i) => i.value);
    // so we instead look at the DOM
    wrapperRef.current?.querySelectorAll("input").forEach((i, idx) => {
      if (idx >= items.length) return; // virtualItem, we ignore it
      if (i.value) filtered.push(items[idx]);
    });
    if (filtered.length !== items.length) {
      setAllItems(filtered);
    }
  };

  // Values update
  // TODO: assess if debouncing is really needed here, onchange is fired only on focus loss
  // (contrary to "oninput" which actually needs debouncing)
  // it seems that React Bootstrap treats onChange as onInput
  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);
  // (limit is not supposed to be 0)
  const limit = question.limit || DEFAULT_LIMIT;

  // Focus management
  const selectPreviousItem = (index: number) =>
    //previous item is necessarily an existing item
    selectItem(wrapperRef.current, items[index - 1]);
  const selectFirstVirtualItem = () =>
    selectItem(wrapperRef.current, virtualItems[0]);
  const selectNextItem = (index: number) => {
    if (index === items.length - 1) {
      return selectFirstVirtualItem();
    }
    return selectItem(wrapperRef.current, items[index + 1]);
  };

  const onFormBlur = (evt: React.FocusEvent<HTMLDivElement>) => {
    // When pressing enter in an input, we lose focus for the input
    // but we are not leaving so we should not remove empty items (otherwise new items are immediately deleted)
    const focusedInForm = evt.currentTarget?.contains(evt.relatedTarget);
    if (!focusedInForm) {
      removeEmptyItems();
    }
  };
  const onItemBlur = (
    index: number,
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> // onBlur
  ) => {
    const value = event.target.value;
    const previousValue = getItemAtIdx(index).value;
    // TODO: this jumps too much, instead use "removeEmptyItems" on the form
    /*if (!value) {
      if (index <= items.length - 1) removeItem(index);
    } else*/ if (value !== previousValue) {
      // only update if the item actually changed otherwise we have competing updates
      updateItem(index, value);
    }
  };

  const onItemChange = (index: number, key: string, evt) => {
    // We only update values on blur,
    // but on change, if the input is virtual,
    // we want to reify it + add new virtual inputs if needed
    const isVirtualItem = index >= items.length;
    const value = evt.target.value;
    if (isVirtualItem) {
      reifyVirtualItem(index, value);
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

      // prevent form submission
      evt.stopPropagation();
      evt.preventDefault();

      // Pressing enter when focusing on an empty last item => submit the form as usual
      // (last item is always empty, sinc starting to type in it will create a new empty last item)
      if (index === items.length) return;

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
        createItemAt(index + 1, true);
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
        removeItemAt(index);
      } else if (items.length > 0) {
        // there are no previous item, but there is a next one
        focusInputEnd(selectNextItem(0));
        removeItemAt(index);
      }
    }
  };

  const itemProps = {
    section,
    question,
    items,
    readOnly,
    wrapperRef,
  };

  const allItems = items.length < limit ? [...items, ...virtualItems] : items;

  return (
    <FormItem {...props} ref={wrapperRef} onBlur={onFormBlur}>
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

  const indexPlaceholder = formatMessage({
    id: `${i18n.base}.placeholder.${index + 1}`,
    values: { index: index + 1 },
  });

  const placeholder =
    indexPlaceholder || questionPlaceholder || defaultPlaceholder;

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
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={readOnly}
      autoFocus={item.autofocus}
    />
  );
};
