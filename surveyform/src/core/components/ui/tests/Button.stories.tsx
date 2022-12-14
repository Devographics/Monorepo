// NOTE: we did not set bootstrap css so it's normal if the style is not perfect
import React from "react";
import { Story, Meta } from "@storybook/react";
import { Button, ButtonProps } from "../Button";

export default {
  component: Button,
  // @see https://github.com/storybookjs/storybook/issues/15534
  title: "react-ui-bootstrap/Button",
  decorators: [
    (Story) => (
      // Replace by VulcanComponents if you need them
      <div>
        <Story />
      </div>
    ),
  ],
  args: {
    children: <>Hello</>,
    variant: "secondary",
  },
  parameters: { actions: { argTypesRegex: "^.*Callback$" } },
} as Meta<ButtonProps>;

const ButtonTemplate: Story<ButtonProps> = (args) => <Button {...args} />;
export const DefaultButton = ButtonTemplate.bind({});
