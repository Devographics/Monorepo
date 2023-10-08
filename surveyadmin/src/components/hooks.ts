import React, { useCallback, useEffect, useRef, useState } from "react";

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
function escapeHTML(str) {
  return new Option(str).innerHTML;
}

// Function to highlight matches in the text
// see https://stackoverflow.com/a/39154413/649299

// /foo/i => foo
const cleanPattern = (pattern) => pattern.slice(1).slice(0, -2);

const getHighlightStartMarker = () => "%##";
const getHighlightEndMarker = () => "##%";

const getHighlightStartTag = (index, isPrimary, pattern) =>
  `<span class="highlighted highlighted-${index} highlighted-${
    isPrimary ? "primary" : "secondary"
  }" data-tooltip="${cleanPattern(pattern)}">`;
const getHighlightEndTag = (index) => `</span>`;

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
    const { isPrimary, pattern, index } = matchObject;
    return tag(index, isPrimary, pattern);
  });
};

type Match = {
  pattern: string;
  isPrimary: boolean;
  index: number;
};
export function highlightMatches(
  text: string,
  regexArray: string[],
  primaryPattern?: string
) {
  let matches: Match[] = [];
  let highlightedText = text;
  if (!regexArray || regexArray.length === 0) {
    return text;
  }
  regexArray.forEach((regexString, index) => {
    const parts = /\/(.*)\/(.*)/.exec(regexString);
    const regex = parts && new RegExp(parts[1], parts[2]);
    const isPrimary = !!(primaryPattern && regexString === primaryPattern);
    highlightedText = highlightedText.replace(regex!, (match) => {
      matches.push({ pattern: regexString, isPrimary, index });
      return `${getHighlightStartMarker()}${match}${getHighlightEndMarker()}`;
    });
  });

  highlightedText = escapeHTML(highlightedText);

  highlightedText = replaceWithTag(
    highlightedText,
    getHighlightStartMarker,
    getHighlightStartTag,
    matches
  );

  highlightedText = replaceWithTag(
    highlightedText,
    getHighlightEndMarker,
    getHighlightEndTag,
    matches
  );

  return highlightedText;
}

export const highlightPatterns = ({
  value,
  patterns,
  normalizedValue,
  currentTokenId,
}: {
  value: string;
  patterns: any[];
  normalizedValue: string[];
  currentTokenId?: string;
}) => {
  if (currentTokenId) {
    // if a token is specified, distinguish between patterns that match that specific token
    // and other patterns

    const normalizedValueIndex = normalizedValue.indexOf(currentTokenId);
    const currentTokenPattern = patterns[normalizedValueIndex];
    const otherTokensPatterns = patterns.filter(
      (value, index) => index !== normalizedValueIndex
    );
    return highlightMatches(value, patterns, currentTokenPattern);
  } else {
    // else just match all patterns
    return highlightMatches(value, patterns);
  }
};
