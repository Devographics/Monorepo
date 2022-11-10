import RaceEthnicity from "~/core/components/forms/RaceEthnicity";
import Email2 from "~/core/components/forms/Email2";
import Hidden from "~/core/components/forms/Hidden";
import { Help } from "~/core/components/forms/Help";
import Bracket from "~/core/components/forms/Bracket";
import Feature from "~/core/components/forms/experience/Feature";
import Tool from "~/core/components/forms/experience/Tool";
import TopN from "~/core/components/forms/TopN";
import Slider from "~/core/components/forms/Slider";
import Select from "~/core/components/forms/Select";
import Checkboxgroup from "~/core/components/forms/Checkboxgroup";
import Radiogroup from "~/core/components/forms/Radiogroup";
import AutocompleteMultiple from "~/core/components/forms/AutocompleteMultiple";
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
  top_n: TopN,
  slider: Slider,
  select: Select,
  checkboxgroup: Checkboxgroup,
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
