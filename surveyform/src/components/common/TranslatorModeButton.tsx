"use client";
import { enableTranslatorMode } from "@devographics/i18n";

export const TranslatorModeButton = () => {
  return (
    <button
      onClick={() => {
        enableTranslatorMode();
      }}
    >
      Translator mode
    </button>
  );
};
