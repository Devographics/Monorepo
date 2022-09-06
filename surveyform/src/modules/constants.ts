import type { SurveyStatus, SurveyStatusLabel } from "~/surveys";

export const statuses: { [label in SurveyStatusLabel]: SurveyStatus } = {
  preview: 1,
  open: 2,
  closed: 3,
  hidden: 4,
};

export const statusesReverse: {
  [status in SurveyStatus]: SurveyStatusLabel;
} = {
  1: "preview",
  2: "open",
  3: "closed",
  4: "hidden",
};

export const statusesOptions: Array<{
  value: SurveyStatus;
  label: Capitalize<SurveyStatusLabel>;
}> = [
  {
    value: 1,
    label: "Preview",
  },
  {
    value: 2,
    label: "Open",
  },
  {
    value: 3,
    label: "Closed",
  },
  {
    value: 4,
    label: "Hidden",
  },
];
