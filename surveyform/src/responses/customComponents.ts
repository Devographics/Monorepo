import RaceEthnicity from "~/surveys/components/inputs/RaceEthnicity";
import Email2 from "~/surveys/components/inputs/Email2";
import Hidden from "~/surveys/components/inputs/Hidden";
import { Help } from "~/surveys/components/inputs/Help";
import Bracket from "~/surveys/components/inputs/Bracket";
import Text from "~/surveys/components/inputs/Default";
import Feature from "~/surveys/components/inputs/experience/Feature";
import Tool from "~/surveys/components/inputs/experience/Tool";
import Slider from "~/surveys/components/inputs/Slider";
import Select from "~/surveys/components/inputs/Select";
import Textarea from "~/surveys/components/inputs/Textarea";
import Checkboxgroup from "~/surveys/components/inputs/Checkboxgroup";
import Radiogroup from "~/surveys/components/inputs/Radiogroup";
import AutocompleteMultiple from "~/surveys/components/inputs/AutocompleteMultiple";
import { makeAutocomplete } from "~/core/utils/autocomplete";

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
  multiautocomplete: AutocompleteMultiple,
};

/**
 * Add React component to templates
 *
 * /!\ Importing this file will load some React
 * so involves JSX, it should not be used in scripts
 * @param questionObject
 * @returns
 */
export const addComponentToQuestionObject = <
  T extends { input: any; autocompleteOptions?: any }
>(
  questionObject: T
): T => {
  let question = questionObject;

  const customComponent = customComponents[questionObject.input];
  if (customComponent) {
    question = { ...questionObject, input: customComponent };
  }

  if (question.autocompleteOptions) {
    question = makeAutocomplete(question, question.autocompleteOptions);
  }

  return question;
};
