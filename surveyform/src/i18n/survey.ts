/**
 * i18n logic specific to survey display
 */
import type {
  SectionMetadata,
  QuestionMetadata,
  OptionMetadata,
} from "@devographics/types";

const separator = ".";

/**
 * Tokens matching "getSectioni18nIds" calls
 * sections.<sectionNamespace>.<base>
 * TODO: could be computed a bit more precisely based on the survey yaml
 */
export const sectionTokens = ["sections.*", "sections.*.*", "sections.*.*.title", "section.*.*.description"]

/**
 * When using this function,
 * be careful to define client tokens accordingly
 * @returns 
 */
export const getSectionTokens = ({
  section,
}: {
  section: SectionMetadata;
}) => {
  const { id: sectionId, intlId } = section;

  const sectionNamespace = sectionId;
  const baseSegments = ["sections", sectionNamespace];
  const base = intlId || baseSegments.join(separator);

  const joinWithBase = (suffix: string) => [base, suffix].join(separator);

  const ids = {
    // e.g. user_info (not used)
    base,
    // e.g. user_info.title => "About You"
    title: joinWithBase("title"),
    // e.g. user_info.description => "Let's get to know the real you."
    description: joinWithBase("description"),
  };

  return ids;
};

/**
 * TODO: could be computed more precisely based on the current survey
 * <sectionNamespace>.<questionNamespace>.title
 */
export const questionTokens = ["*.*.title", "*.*.description", "*.*.question", "*.*.note", "*.*.others"]

export const getQuestioni18nIds = ({
  section,
  question,
}: {
  section: SectionMetadata;
  question: QuestionMetadata;
}) => {
  const { id: sectionId, slug } = section;
  const {
    id: questionId,
    sectionId: questionSectionId,
    i18nNamespace,
    intlId,
  } = question;

  const sectionNamespace = questionSectionId || slug || sectionId;
  const questionNamespace = i18nNamespace || questionId;

  const baseSegments = [sectionNamespace, questionNamespace];
  const base = intlId || baseSegments.join(separator);

  const joinWithBase = (suffix: string) => [base, suffix].join(separator);

  const ids = {
    // e.g. user_info.yearly_salary => "Yearly Salary" (legacy)
    base,
    // e.g. user_info.yearly_salary.title => "Yearly Salary"
    title: joinWithBase("title"),
    // e.g. user_info.yearly_salary.description => "How much do you earn?" (legacy)
    description: joinWithBase("description"),
    // e.g. user_info.yearly_salary.question => "How much do you earn?"
    question: joinWithBase("question"),
    // e.g. user_info.yearly_salary.note => a note about the question displayed below
    note: joinWithBase("note"),
    // e.g. resources.video_creators.others => "Other video creators" (legacy)
    others: joinWithBase("others"),
  };

  return ids;
};

/**
 * TODO: compute more precisely 
 * options.<questionNamespace>.<questionId>.description
 */
export const optionsTokens = ["options.*.*", "options.*.*.description"]

export const getOptioni18nIds = ({
  question,
  option,
}: {
  question: QuestionMetadata;
  option: OptionMetadata;
}) => {
  const { id, intlId } = option;
  const { id: questionId, i18nNamespace } = question;
  const questionNamespace = i18nNamespace || questionId;

  const baseSegments = ["options", questionNamespace, id];
  const base = intlId || baseSegments.join(separator);

  const ids = {
    // e.g. options.yearly_salary.range_1000_2000
    base,
    // e.g. options.yearly_salary.range_1000_2000.description
    description: [base, "description"].join(separator),
  };

  return ids;
};
