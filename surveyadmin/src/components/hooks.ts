import React, { useCallback, useEffect, useRef, useState } from "react";
import sortBy from "lodash/sortBy";
import { isNumber } from "lodash";

export const useLocalStorage = (storageKey, fallbackState) => {
  let initState = fallbackState;
  try {
    const localStorageState = localStorage.getItem(storageKey);
    if (localStorageState) {
      initState = JSON.parse(localStorageState);
    }
  } catch (error) {}
  const [value, setValue] = React.useState(initState);

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  return [value, setValue];
};

// see https://blog.logrocket.com/implementing-copy-clipboard-react-clipboard-api/
async function copyToClipboard(text) {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
}

export function useCopy(
  str: string
): [boolean, () => void, (value: boolean) => void] {
  const copyableString = useRef(str);
  const [copied, setCopied] = useState(false);

  const copyAction = useCallback(async () => {
    const copied = await copyToClipboard(copyableString.current);
    setCopied(!!copied);
  }, [copyableString]);

  useEffect(() => {
    copyableString.current = str;
  }, [str]);

  return [copied, copyAction, setCopied];
}

// see https://stackoverflow.com/a/22706073/649299
export function escapeHTML(str) {
  return new Option(str).innerHTML;
}

// Function to highlight matches in the text
// see https://stackoverflow.com/a/39154413/649299

// /foo/i => foo
const cleanPattern = (pattern) => pattern.slice(1).slice(0, -2);

const getHighlightStartMarker = () => "%##";
const getHighlightEndMarker = () => "##%";

const getHighlightStartTag = ({ index, isPrimary, isFilterQuery, pattern }) =>
  `<span class="highlighted highlighted-${index} highlighted-${
    isPrimary || isFilterQuery ? "primary" : "secondary"
  }" data-tooltip="${cleanPattern(pattern)}">`;
const getHighlightEndTag = (options) => `</span>`;

const replaceWithTag = (text, marker, tag, matches: Match[]) => {
  let hlStartRegex = new RegExp(marker(), "g");
  let i = 0;
  return text.replace(hlStartRegex, (match) => {
    const matchObject = matches[i++];

    if (!matchObject) {
      console.log(matches);
      console.log(i);
      return "";
    }
    const { isPrimary, isFilterQuery, pattern, index } = matchObject;
    return tag({ index, isPrimary, pattern, isFilterQuery });
  });
};

type Match = {
  pattern: string;
  isPrimary: boolean;
  isFilterQuery: boolean;
  index: number;
  offset: number;
};
export function highlightMatches(
  text: string,
  regexArray: string[],
  primaryPattern?: string,
  filterQueryPattern?: string
) {
  // const regexArray = filterQueryPattern
  //   ? [filterQueryPattern, ...patterns]
  //   : patterns;

  let matches: Match[] = [];
  let highlightedText = text;
  if (!regexArray || regexArray.length === 0) {
    return text;
  }
  regexArray.forEach((regexString, index) => {
    const parts = /\/(.*)\/(.*)/.exec(regexString);
    const regex = parts && new RegExp(parts[1], parts[2]);
    const isPrimary = !!(primaryPattern && regexString === primaryPattern);
    const isFilterQuery = !!(
      filterQueryPattern && regexString === filterQueryPattern
    );
    highlightedText = highlightedText.replace(
      regex!,
      (match, offset1, offset2) => {
        // for whatever reason, offset is sometimes the 2nd element
        // and sometimes the 3rd
        const offset = isNumber(offset1) ? offset1 : offset2;
        matches.push({
          pattern: regexString,
          isPrimary,
          isFilterQuery,
          index,
          offset,
        });
        return `${getHighlightStartMarker()}${match}${getHighlightEndMarker()}`;
      }
    );
  });

  // sort matches by the order that they appear in the string
  const sortedMatches = sortBy(matches, "offset");

  highlightedText = escapeHTML(highlightedText);

  highlightedText = replaceWithTag(
    highlightedText,
    getHighlightStartMarker,
    getHighlightStartTag,
    sortedMatches
  );

  highlightedText = replaceWithTag(
    highlightedText,
    getHighlightEndMarker,
    getHighlightEndTag,
    sortedMatches
  );

  return highlightedText;
}

export const highlightPatterns = ({
  value,
  patterns,
  normalizedValue,
  currentTokenId,
  filterQueryPattern,
}: {
  value: string;
  patterns: any[];
  normalizedValue: string[];
  currentTokenId?: string;
  filterQueryPattern?: string;
}) => {
  if (currentTokenId && normalizedValue) {
    // if a token is specified, distinguish between patterns that match that specific token
    // and other patterns

    const normalizedValueIndex = normalizedValue.indexOf(currentTokenId);
    const currentTokenPattern = patterns[normalizedValueIndex];

    return highlightMatches(
      value,
      patterns,
      currentTokenPattern,
      filterQueryPattern
    );
  } else {
    // else just match all patterns
    return highlightMatches(value, patterns, undefined, filterQueryPattern);
  }
};
