import RaceEthnicity from "~/components/inputs/RaceEthnicity";
import Email2 from "~/components/inputs/Email2";
import Hidden from "~/components/inputs/Hidden";
import { Help } from "~/components/inputs/Help";
import Bracket from "~/components/inputs/Bracket";
import Text from "~/components/inputs/Default";
import Number from "~/components/inputs/Number";
import Feature from "~/components/inputs/experience/Feature";
import Featurev3 from "~/components/inputs/experience/Featurev3";
import Tool from "~/components/inputs/experience/Tool";
import Slider from "~/components/inputs/Slider";
import Select from "~/components/inputs/Select";
import Textarea from "~/components/inputs/Textarea";
import Checkboxgroup from "~/components/inputs/Checkboxgroup";
import CheckboxgroupSentiment from "~/components/inputs/CheckboxgroupSentiment";
import Radiogroup from "~/components/inputs/Radiogroup";
import Projects from "~/components/inputs/Projects";
import { QuestionMetadata, QuestionTemplateOutput } from "@devographics/types";
import { TextList } from "~/components/inputs/TextList";

const customComponents = {
  help: Help,
  receive_notifications: Email2,
  hidden: Hidden,
  race_ethnicity: RaceEthnicity,
  bracket: Bracket,
  feature: Feature,
  featurev3: Featurev3,
  tool: Tool,
  slider: Slider,
  dropdown: Select,
  country: Select,
  multiple: Checkboxgroup,
  /**
   * Just a shortcut for multiple + allowOther=true
   */
  multipleWithOther: Checkboxgroup,
  multipleWithOtherSentiment: CheckboxgroupSentiment,
  longtext: Textarea,
  // TODO: enable TextList component textlist: TextList,
  textlist: TextList,
  text: Text,
  others: Text,
  single: Radiogroup,
  singleWithOther: Radiogroup,
  happiness: Radiogroup,
  projects: Projects,
  opinion: Radiogroup,
  number: Number,
};

export const getQuestionComponent = (
  question: QuestionMetadata | QuestionTemplateOutput
) => {
  const componentName = question.inputComponent || question.template;
  const customComponent = customComponents[componentName];
  if (!customComponent) {
    console.log(question);
    throw Error(
      `Could not find question component for question ${question.id} with template ${componentName}`
    );
  }
  return customComponent;
};
