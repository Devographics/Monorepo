"use client";
import React, { useRef, useState, useEffect, memo, useCallback } from "react";
import FormControl from "react-bootstrap/FormControl";
import { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";
import { useI18n } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "~/lib/i18n/survey";

const MemoFormControl = memo(FormControl);

type KeyEvent = React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>;

// Items management

/**
 * In an array of input with auto-deletion of empty inputs,
 * each input must be associated with a key to become an entity
 *
 * Items are uncontrolled, so initialValue doesn't change after 1st mount
 */
interface Item {
  key: string;
  // focus when the input is insereted
  autofocus?: boolean;
  initialValue: string;
}

const itemId = (key: string) => `textlist-item-${key}`;
const itemSelector = (key: string) => `[data-id="${itemId(key)}"]`;
const keysMemo = (items: Array<Item>): string =>
  items.map((i) => i.key).join("-");
const selectItem = (
  wrapper: Element | undefined | null,
  key: string
): HTMLInputElement | null | undefined => {
  const maybeItem = wrapper?.querySelector(itemSelector(key));
  if (!maybeItem) console.warn(`Item key ${key} not found`);
  if (maybeItem instanceof HTMLInputElement) {
    return maybeItem;
  }
};
/**
 * Inputs are all uncontrolled
 */
const getItemValues = (
  wrapper: Element | undefined | null,
  items: Array<Item>
) => {
  const itemElems = items
    .map((item) => selectItem(wrapper, item.key))
    .filter((itemElem) => !!itemElem);
  return itemElems.map((ie) => ie?.value || "");
};
const getEmptyKeys = (
  wrapper: Element | undefined | null,
  items: Array<Item>
) => {
  return items
    .map(({ key }) => ({
      key,
      value: selectItem(wrapper, key)?.value,
    }))
    .filter(({ value }) => !value)
    .map(({ key }) => key);
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
 * Allow to have a delay between removing content,
 * and switching to previous item
 *
 * - if user keeps "backspace" pressed,
 * wait for a keyUp to actually switch to prev input
 * - if user press "backspace" rapidly
 * wait a courtesy delay in addition to the keyUp event
 */
const useDeletionDelay = (delay: number = 200) => {
  const deletedContentRef = useRef<{
    /** Unique id for the content */
    id: string | number;
    timeoutHandle: any;
  } | null>(null);
  const hasNotUppedRef = useRef<boolean>(false);
  const resetTimeout = () => {
    if (deletedContentRef.current?.timeoutHandle) {
      clearTimeout(deletedContentRef.current?.timeoutHandle);
    }
  };
  return {
    /**
     * Indicate that user has deleted some content
     * This should disable other "backspace" related actions
     * until user press keyup + a short delay has passed
     */
    deletedContent: (id: string | number) => {
      resetTimeout();
      const timeoutHandle = setTimeout(() => {
        deletedContentRef.current = null;
      }, delay);
      deletedContentRef.current = { id, timeoutHandle };
      hasNotUppedRef.current = true;
    },
    resetDeletionDelay: () => {
      resetTimeout();
      deletedContentRef.current = null;
      hasNotUppedRef.current = false;
    },
    hasJustDeletedContent: (id: string | number) => {
      return deletedContentRef.current?.id === id || hasNotUppedRef.current;
    },
    hasUpped: () => {
      hasNotUppedRef.current = false;
    },
  } as const;
};

/**
 * Manage a set of real and virtual values
 * TODO: useReducer instead of using state
 */
const useRealVirtualItems = (values: Array<string>, limit?: number) => {
  const getUniqueKey = useUniqueSeq();
  // guarantee a unique key
  function makeItem(value: string, autofocus?: boolean): Item {
    return { initialValue: value, key: getUniqueKey() + "", autofocus };
  }

  // state, virtual and additional values
  const [{ items, virtualItems }, setRealVirtualItems] = useState<{
    items: Array<Item>;
    virtualItems: Array<Item>;
  }>({
    items: values.map((val) => makeItem(val)),
    /** We need virtual items in state in order to keep consistent keys */
    virtualItems: Array(expectedNbVirtual(values.length))
      .fill(null)
      .map(() => makeItem("")),
  });
  const setItems = useCallback(
    (cb: (items: Array<Item>) => Array<Item>) => {
      setRealVirtualItems(({ items, virtualItems }) => ({
        items: cb(items),
        virtualItems,
      }));
    },
    [setRealVirtualItems]
  );
  function expectedNbVirtual(nbItems: number) {
    // Virtual fields incitate user to answer
    // We need only one virtual field if the user has started filling the textList
    if (nbItems >= (limit || DEFAULT_LIMIT)) return 0;
    if (nbItems) return 1;
    return INITIAL_VIRTUAL_ITEMS;
  }

  // Manage virtual items
  const refillVirtualItems = useCallback(() => {
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
  }, [setRealVirtualItems]);
  /**
   * Make the virtual item = add it to items,
   * remove it from virtual, and add more virtual fields if needed
   * @param item
   */
  const reifyVirtualItem = useCallback(
    (index: number, value: string) => {
      setRealVirtualItems(({ items, virtualItems }) => {
        // We actually reify all virtual items BEFORE the reified one
        const reifiedItems = virtualItems.slice(0, index - items.length + 1);
        reifiedItems[index - items.length].initialValue = value;
        return {
          items: [...items, ...reifiedItems],
          virtualItems: virtualItems.slice(index - items.length + 1), // refill is handled by a separate method,
        };
      });
      refillVirtualItems();
    },
    [setRealVirtualItems, refillVirtualItems]
  );

  // Manage real items
  const createItemAt = useCallback(
    (index: number, autofocus?: true) => {
      const item = makeItem("", autofocus);
      setItems((items) => [
        ...items.slice(0, index),
        item,
        ...items.slice(index),
      ]);
    },
    [setItems]
  );
  const removeItemAt = useCallback(
    (idx: number) => {
      setItems((items) => [...items.slice(0, idx), ...items.slice(idx + 1)]);
      refillVirtualItems();
    },
    [setItems, refillVirtualItems]
  );

  const removeKeys = useCallback(
    (keys: Array<string>) => {
      setItems((items) => items.filter(({ key }) => !keys.includes(key)));
      refillVirtualItems();
    },
    [setItems]
  );

  return [
    { items, virtualItems },
    {
      reifyVirtualItem,
      createItemAt,
      removeItemAt,
      removeKeys,
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
const TextList = (props: FormInputProps<Array<string>>) => {
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
    const values = updateCurrentValues({
      [path]: items.length ? getItemValues(wrapperRef.current, items) : null,
    });
  };
  const updateValueDebounced = debounce(updateValue, 300);

  const [
    { items, virtualItems },
    { reifyVirtualItem, createItemAt, removeItemAt, removeKeys },
  ] = useRealVirtualItems(values, question.limit);
  const deletionDelay = useDeletionDelay();

  useEffect(() => {
    updateValue(items);
  }, [items]);

  const removeEmptyItems = useCallback(() => {
    const emptyKeys = getEmptyKeys(wrapperRef.current, items);
    if (emptyKeys.length) {
      removeKeys(emptyKeys);
    }
  }, [keysMemo(items)]);

  // (limit is not supposed to be 0)
  const limit = question.limit || DEFAULT_LIMIT;

  // Focus management
  const selectPreviousItem = useCallback(
    (index: number) => {
      if (index > items.length) {
        return selectItem(wrapperRef.current, virtualItems[index - 1].key);
      }
      return selectItem(wrapperRef.current, items[index - 1].key);
    },
    [keysMemo(items), keysMemo(virtualItems)]
  );
  const selectFirstVirtualItem = useCallback(
    // We may have no virtualItems when reaching the limit and the last virtual item is turned into a real one
    () => selectItem(wrapperRef.current, virtualItems[0]?.key),
    [virtualItems[0]?.key]
  );

  const hasNextItem = useCallback(
    (index: number) => {
      const nextIdx = index + 1;
      if (nextIdx > limit - 1) return false;
      return true;
    },
    [keysMemo(items), keysMemo(virtualItems)]
  );
  const selectNextItem = useCallback(
    (index: number) => {
      if (index === items.length - 1) {
        return selectFirstVirtualItem();
      }
      return selectItem(wrapperRef.current, items[index + 1].key);
    },
    [keysMemo(items), keysMemo(virtualItems), hasNextItem]
  );

  const onFormBlur = useCallback(
    (evt: React.FocusEvent<HTMLDivElement>) => {
      // When pressing enter in an input, we lose focus for the input
      // but we are not leaving so we should not remove empty items (otherwise new items are immediately deleted)
      const focusedInForm = evt.currentTarget?.contains(evt.relatedTarget);
      if (!focusedInForm) {
        removeEmptyItems();
      }
    },
    [removeEmptyItems]
  );
  const onItemBlur = useCallback(
    (
      index: number,
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> // onBlur
    ) => {
      updateValue(items);
    },
    [items]
  );

  const onItemChange = useCallback(
    (
      index: number,
      key: string,
      evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      // We only update values on blur,
      // but on change, if the input is virtual,
      // we want to reify it + add new virtual inputs if needed
      const isVirtualItem = index >= items.length;
      const value = evt.target.value;
      if (isVirtualItem) {
        reifyVirtualItem(index, value);
      }
      updateValueDebounced(items);
    },
    [reifyVirtualItem, keysMemo(items)]
  );
  /**
   * if pressing backspace in an empty input,
   * may remove the item and switch to previous
   */
  const onBackspaceDeleteKeyDown = useCallback(
    (
      evt: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number
    ) => {
      // @ts-ignore TODO: not sure why we don't have a value despite using an HTMLInputElement
      const value: string = evt.target.value;
      // let the input handle deletion if there are chars to delete
      if (value.length > 0) {
        deletionDelay.deletedContent(index);
        return;
      }
      if (deletionDelay.hasJustDeletedContent(index)) {
        // if user has deleted content, we wait a small delay + a keyup
        // before enabling any other interaction
        return;
      }
      // we can now run the additional UX linked to the backspace press
      // = swithcing to  previous input/removing item
      evt.preventDefault();
      // immediately reset deletion event ref
      deletionDelay.resetDeletionDelay();
      if (index >= items.length) {
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
    },
    [removeItemAt, selectNextItem, selectPreviousItem]
  );
  const onItemKeyUp = useCallback((evt: KeyEvent) => {
    if (evt.key === "Backspace" || evt.key === "Delete") {
      deletionDelay.hasUpped();
    }
  }, []);
  const onItemKeyDown = useCallback(
    (index: number, evt: KeyEvent) => {
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
        if (!nextItem) return; // may happen if we are reaching the limit
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
        onBackspaceDeleteKeyDown(evt, index);
      }
    },
    [items.length, selectNextItem]
  );

  const itemProps = {
    section,
    question,
    readOnly,
    wrapperRef,
    onItemBlur,
    onItemChange,
    onItemKeyDown,
    onItemKeyUp,
  };

  const allItems = items.length < limit ? [...items, ...virtualItems] : items;

  return (
    <FormItem {...props} ref={wrapperRef} onBlur={onFormBlur}>
      {allItems.map((item, index) => (
        <TextListItem key={item.key} {...itemProps} index={index} item={item} />
      ))}
    </FormItem>
  );
};

// having a global object avoids unexpected rerenders of the memoized component
const formControlStyle: React.CSSProperties = {
  marginTop: "4px",
  marginBottom: "4px",
};

const TextListItem = memo(function TextListItem({
  section,
  question,
  item,
  index,
  readOnly,
  onItemBlur,
  onItemChange,
  onItemKeyDown,
  onItemKeyUp,
}: {
  section: FormInputProps["section"];
  question: FormInputProps["question"];
  item: Item;
  index: number;
  readOnly?: boolean;
  onItemBlur: any;
  onItemChange: any;
  onItemKeyDown: any;
  onItemKeyUp: any;
}) {
  const { getFallbacks } = useI18n();
  const index_ = index + 1;
  const i18n = getQuestioni18nIds({ section, question });

  const placeholder = getFallbacks(
    [
      `${i18n.base}.placeholder.${index_}`,
      `${i18n.base}.placeholder`,
      "textlist.placeholder",
    ],
    { index: index_ }
  );

  const onBlur = useCallback((evt) => onItemBlur(index, evt), [onItemBlur]);
  const onChange = useCallback(
    (evt) => onItemChange(index, item.key, evt),
    [onItemChange]
  );
  const onKeyDown = useCallback(
    (evt) => onItemKeyDown(index, evt),
    [onItemKeyDown]
  );
  const onKeyUp = useCallback((evt) => onItemKeyUp(evt), [onItemKeyUp]);
  return (
    <MemoFormControl
      // id={itemId(item)}
      // boostrap ain't happy with id, we just need a way to select the input imperatively to handle focus
      data-id={itemId(item.key)}
      style={formControlStyle}
      // TODO: use different templates to simplify?
      as={question.longText ? "textarea" : "input"}
      placeholder={placeholder?.t}
      defaultValue={item.initialValue}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      disabled={readOnly}
      autoFocus={item.autofocus}
    />
  );
});

export default memo(TextList);
