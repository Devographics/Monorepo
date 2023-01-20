/*

Example Usage

<Components.MutationButton
  label="Cancel Subscription"
  variant="primary"
  mutationOptions={{
    name: 'cancelSubscription',
    args: { bookingId: 'String' },
    fragmentName: 'BookingsStripeDataFragment',
  }}
  mutationArguments={{ bookingId: booking._id }}
  submitCallback={() => {}}
  successCallback={result => { console.log(result) }}
/>

*/
import React, { useState } from "react";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";
// TODO: user our custom SWR hook instead
import { useMutation } from "urql";
import { useVulcanComponents } from "../VulcanComponents/Consumer";
import type { LoadingButtonProps } from "./LoadingButton";
// import withMutation from '../containers/registeredMutation';

// TODO:
/**
 * Difference with Vulcan Meteor: there is no
 * registered mutation anymore,
 * so you need to pass your mutations explicitely, using graphql
 */
/*
export class MutationButton extends PureComponent {
  constructor(props) {
    super(props);
    this.button = withMutation(props.mutationOptions)(MutationButtonInner);
  }

  render() {
    const Component = this.button;
    return <Component {...this.props} />;
  }
}*/

export interface MutationButtonProps {
  /**
   * NOTE: in Vulcan Meteor you had to write:
   * mutationOptions: { name: "foobar", mutationOptions: {refetchQueries:["hello"]}}
   *
   * In Vulcan Next, you can only pass the "mutationOptions" object:
   * mutationOptions: { refetchQueries:["hello"]}
   * and the mutation is provided via the new "mutation" prop
   */
  mutationOptions?: any; //MutationHookOptions;
  /**
   * @example
    mutation: gql`
      mutation sampleMutation($input: Input) {
        hello
      }
    `,
   */
  mutation: string | DocumentNode;
  /** Variables passed to the mutation (NOTE: we can't pass other options at the moment) */
  mutationArguments?: any; //MutationHookOptions<any>["variables"];
  /** Callback run before submitting. Can optionnaly return mutationArguments that will override current ones. */
  submitCallback?: (
    mutationArgumentsFromProps: any //MutationHookOptions<any>["variables"]
  ) =>
    | void
    | any //{ mutationArguments: any,// MutationHookOptions<any>["variables"] }
    | Promise<
        void | any /*{
      mutationArguments: any//MutationHookOptions<any>["variables"];
    }*/
      >;
  successCallback?: (res: any) => void | Promise<void>;
  errorCallback?: (err: any) => void | Promise<void>;
  /** Now isolated into their own object to avoid needed to explicitely pick/omit */
  loadingButtonProps?: LoadingButtonProps;
  /** Shortcut for loadingButtonProps.label */
  label?: string | React.ReactNode;
}
export const MutationButton = (props: MutationButtonProps) => {
  const Components = useVulcanComponents();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | undefined>();

  const {
    //mutationOptions,
    mutation,
    loadingButtonProps = {},
    label,
  } = props;
  let { mutationArguments } = props;
  const mutationAsNode =
    typeof mutation === "string"
      ? gql`
          ${mutation}
        `
      : mutation;
  const [mutationRes, mutationFunc] = useMutation(mutationAsNode);

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    const {
      //mutationOptions,
      submitCallback,
      successCallback,
      errorCallback,
    } = props;
    //const mutationName = mutationOptions.name;
    //const mutation = this.props[mutationName];

    try {
      if (submitCallback) {
        const callbackReturn = await submitCallback(mutationArguments);
        if (callbackReturn && callbackReturn.mutationArguments) {
          mutationArguments = callbackReturn.mutationArguments;
        }
      }
      const result = await mutationFunc({ variables: mutationArguments });
      if (successCallback) {
        await successCallback(result);
      }
    } catch (error) {
      // TODO: may not work because the mutationFunc may not throw in case of error
      setError(error);
      if (errorCallback) {
        await errorCallback(error);
      }
    } finally {
      setLoading(false);
    }

    // mutation(mutationArguments)
    //   .then(result => {
    //     this.setState({ loading: false });
    //     if (successCallback) {
    //       successCallback(result);
    //     }
    //   })
    //   .catch(error => {
    //     this.setState({ loading: false });
    //     if (errorCallback) {
    //       errorCallback(error);
    //     }
    //   });
  };

  //const mutationName = this.props.mutationOptions.name;

  const loadingButton = (
    <Components.LoadingButton
      loading={loading}
      onClick={handleClick}
      label={label}
      {...loadingButtonProps}
    />
  );

  if (error) {
    return (
      <Components.TooltipTrigger trigger={loadingButton} defaultShow={true}>
        {error.message.replace("GraphQL error: ", "")}
      </Components.TooltipTrigger>
    );
  }
  return loadingButton;
};
