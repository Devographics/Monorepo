import RaceEthnicity from "~/components/inputs/RaceEthnicity";
import Email2 from "~/components/inputs/Email2";
import Hidden from "~/components/inputs/Hidden";
import { Help } from "~/components/inputs/Help";
import Bracket from "~/components/inputs/Bracket";
import Text from "~/components/inputs/Default";
import Feature from "~/components/inputs/experience/Feature";
import Tool from "~/components/inputs/experience/Tool";
import Slider from "~/components/inputs/Slider";
import Select from "~/components/inputs/Select";
import Textarea from "~/components/inputs/Textarea";
import Checkboxgroup from "~/components/inputs/Checkboxgroup";
import Radiogroup from "~/components/inputs/Radiogroup";
import AutocompleteMultiple from "~/components/inputs/AutocompleteMultiple";

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

  // if (question.autocompleteOptions) {
  //   question = makeAutocomplete(question, question.autocompleteOptions);
  // }

  return question;
};
