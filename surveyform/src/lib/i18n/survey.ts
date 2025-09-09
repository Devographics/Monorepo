/**
 * i18n logic specific to survey display
 */
import type {
  SectionMetadata,
  QuestionMetadata,
  OptionMetadata,
} from "@devographics/types";

import {
  separator,
  getSectioni18nIds,
  getQuestioni18nIds as getQuestioni18nIds_,
  getOptioni18nIds as getOptioni18nIds_,
} from "@devographics/i18n";

export const getQuestioni18nIds = getQuestioni18nIds_;

/**
 * Tokens matching "getSectioni18nIds" calls
 * sections.<sectionNamespace>.<base>
 * TODO: could be computed a bit more precisely based on the survey yaml
 */
export const sectionTokens = [
  "sections.*",
  "sections.*.*",
  "sections.*.*.title",
  "section.*.*.description",
];

/**
 * When using this function,
 * be careful to define client tokens accordingly
 * @returns
 */
export const getSectionTokens = getSectioni18nIds;

/**
 * TODO: could be computed more precisely based on the current survey
 * <sectionNamespace>.<questionNamespace>.title
 */
export const questionTokens = [
  "*.*.title",
  "*.*.description",
  "*.*.question",
  "*.*.note",
  "*.*.others",
];

/**
 * TODO: compute more precisely
 * options.<questionNamespace>.<questionId>.description
 */
export const optionsTokens = ["options.*.*", "options.*.*.description"];

export const getOptioni18nIds = getOptioni18nIds_;
