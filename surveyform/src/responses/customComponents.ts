import RaceEthnicity from "~/form/components/inputs/RaceEthnicity";
import Email2 from "~/form/components/inputs/Email2";
import Hidden from "~/form/components/inputs/Hidden";
import { Help } from "~/form/components/inputs/Help";
import Bracket from "~/form/components/inputs/Bracket";
import Text from "~/form/components/inputs/Default";
import Feature from "~/form/components/inputs/experience/Feature";
import Tool from "~/form/components/inputs/experience/Tool";
import Slider from "~/form/components/inputs/Slider";
import Select from "~/form/components/inputs/Select";
import Textarea from "~/form/components/inputs/Textarea";
import Checkboxgroup from "~/form/components/inputs/Checkboxgroup";
import Radiogroup from "~/form/components/inputs/Radiogroup";
import AutocompleteMultiple from "~/form/components/inputs/AutocompleteMultiple";
import { makeAutocomplete } from "~/core/utils/autocomplete";
import type { ParsedQuestion } from "@devographics/core-models";

const customComponents = {
  help: Help,
  email2: Email2,
  hidden: Hidden,
  raceEthnicity: RaceEthnicity,
  bracket: Bracket,
  feature: Feature,
  tool: Tool,
  slider: Slider,
  select: Select,
  checkboxgroup: Checkboxgroup,
  textarea: Textarea,
  text: Text,
  radiogroup: Radiogroup,
  multiautocomplete: AutocompleteMultiple
};

/**
 * Add React component to templates
 *
 * /!\ Importing this file will load some React
 * so involves JSX, it should not be used in scripts
 * @param questionObject
 * @param section
 * @param number
 * @returns
 */
export const addComponentToQuestionObject = (
  questionObject: ParsedQuestion
) => {
  let question = questionObject

  const customComponent = customComponents[questionObject.input];
  if (customComponent) {
    question = { ...questionObject, input: customComponent };
  }

  if (question.autocompleteOptions) {
    question = makeAutocomplete(
      question,
      question.autocompleteOptions
    );
  }

  return question;
};
