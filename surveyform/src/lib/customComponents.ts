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
import Projects from "~/components/inputs/Projects";
import { QuestionMetadata } from "@devographics/types";

const customComponents = {
  help: Help,
  email2: Email2,
  hidden: Hidden,
  race_ethnicity: RaceEthnicity,
  bracket: Bracket,
  feature: Feature,
  tool: Tool,
  slider: Slider,
  select: Select,
  country: Select,
  multiple: Checkboxgroup,
  longtext: Textarea,
  text: Text,
  others: Text,
  single: Radiogroup,
  projects: Projects,
  opinion: Radiogroup,
};

export const getQuestionComponent = (question: QuestionMetadata) => {
  const templateName = question.extends || question.template;
  const customComponent = customComponents[templateName];
  if (!customComponent) {
    throw Error(
      `Could not find question component for question ${question.id} with template ${templateName}`
    );
  }
  return customComponent;
};
