import React from "react";
import { Story, Meta } from "@storybook/react";
import { MutationButton, MutationButtonProps } from "../MutationButton";
import gql from "graphql-tag";
import {
  defaultCoreComponents,
  VulcanComponentsProvider,
} from "../../VulcanComponents";
// NOTE: this is a DEV ONLY dependency because we need some component implementation
// It should never be a normal dependency otherwise it would create a circular dependency!
import {
  liteCoreComponents,
  Alert,
  Button,
  Loading,
  FormattedMessage,
  TooltipTrigger,
} from "@vulcanjs/react-ui-lite";

export default {
  component: MutationButton,
  title: "react-ui/MutationButton",
  decorators: [
    (Story) => {
      return (
        <VulcanComponentsProvider
          value={{
            ...defaultCoreComponents,
            Alert,
            Button,
            Loading,
            FormattedMessage,
            TooltipTrigger,
            // NOTE: when we do this, the "context" of liteCoreComponents is not the right one
            // So this only works with "leaf" components that do not have a child "Components.Something"
            // If it doesn't work, you need to move the story into "react-ui-lite" instead
          }}
        >
          <Story />
        </VulcanComponentsProvider>
      );
    },
  ],
  args: {
    mutation: gql`
      mutation sampleMutation($input: Input) {
        hello
      }
    `,
    mutationArguments: { input: { foo: "bar" } },
    loadingButtonProps: {
      label: "Click me",
    },
  },
  parameters: { actions: { argTypesRegex: "^.*Callback$" } },
} as Meta<MutationButtonProps>;

const MutationButtonTemplate: Story<MutationButtonProps> = (args) => (
  <MutationButton {...args} />
);
export const DefaultMutationButton = MutationButtonTemplate.bind({});

export const WithClassName = MutationButtonTemplate.bind({});
WithClassName.args = {
  loadingButtonProps: {
    label: "Click me",
    className: "btn btn-primary",
  },
};
