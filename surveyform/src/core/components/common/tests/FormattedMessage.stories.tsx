import React from "react";
import { Story, Meta } from "@storybook/react";
import { FormattedMessage, FormattedMessageProps } from "../FormattedMessage";

export default {
  component: FormattedMessage,
  title: "FormattedMessage",
  decorators: [
    (Story) => (
      // Replace by VulcanComponents if you need them
      <div>
        <Story />
      </div>
    ),
  ],
  args: {},
  parameters: { actions: { argTypesRegex: "^.*Callback$" } },
} as Meta<FormattedMessageProps>;

const FormattedMessageTemplate: Story<FormattedMessageProps> = (args) => (
  <FormattedMessage {...args} />
);
export const DefaultFormattedMessage = FormattedMessageTemplate.bind({});

export const UnknownId = FormattedMessageTemplate.bind({});
UnknownId.args = {
  id: "unknown-id-should-be-displayed-as-is",
};
