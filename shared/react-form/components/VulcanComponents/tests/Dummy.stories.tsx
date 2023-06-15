import React from "react";
import { Story, Meta } from "@storybook/react";
import { Dummy, DummyProps } from "../Dummy";
export default {
  component: Dummy,
  title: "VulcanComponents/Dummy",
  // decorators: [(Story) => <Story />],
  args: {},
  parameters: { actions: { argTypesRegex: "^.*Callback$" } },
} as Meta<DummyProps>;

const DummyTemplate: Story<DummyProps> = (args) => <Dummy {...args} />;
export const DefaultDummy = DummyTemplate.bind({});
