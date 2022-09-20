import React from "react";

import { Extras } from "@sentry/types";

import { captureException } from "@sentry/nextjs";
// import { captureException } from "~/services/SentryService";
import {
  DefaultErrorDisplay,
  DefaultErrorProps,
} from "~/core/components/error/DefaultError";

/*
const DefaultError = ({
  message,
}: {
  message: string;
  proposeReload?: boolean;
  onReload?: any;
}) => {
  return <span>{message}</span>;
};
*/

export type ErrorBoundaryFallbackComponent = React.ComponentType<{
  error?: Error;
  statusCode?: number;
}>;
interface ErrorBoundaryProps
  extends Pick<
  DefaultErrorProps,
  "proposeReload" | "proposeHomeRedirection" | "proposeLoginRedirection"
  > {
  onError?: (error: Error, info: { componentStack: string }) => void;
  resetFunction?: (reset: () => void) => void;
  fallbackComponent?: ErrorBoundaryFallbackComponent; // TODO: more precisely it must be a component that accepts optional error and statusCode as props
}

interface ErrorBoundaryState {
  error: Error | null;
}

const initialState: ErrorBoundaryState = { error: null };

/**
 * Generic error boundary for page or components
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = initialState;
  }

  reset() {
    window.location.reload();
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureException(error, { extra: errorInfo as unknown as Extras });
  }

  render() {
    const { error } = this.state;
    const { fallbackComponent: FallbackComponent } = this.props;
    if (error !== null) {
      return FallbackComponent ? (
        <FallbackComponent error={error} />
      ) : (
        <DefaultErrorDisplay
          message={error.message}
          proposeReload={this.props.proposeReload}
          proposeHomeRedirection={this.props.proposeHomeRedirection}
          proposeLoginRedirection={this.props.proposeLoginRedirection}
          onReload={this.reset}
        />
      );
    }

    return this.props.children;
  }
}
