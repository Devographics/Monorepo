"use client";
import React, { Component, ComponentType } from "react";

import {
  DefaultErrorDisplay,
  DefaultErrorProps,
} from "~/components/error/DefaultError";

export type ErrorBoundaryFallbackComponent = ComponentType<{
  error?: Error;
  statusCode?: number;
  children?: React.ReactNode;
}>;
interface ErrorBoundaryProps
  extends Pick<
    DefaultErrorProps,
    "proposeReload" | "proposeHomeRedirection" | "proposeLoginRedirection"
  > {
  children: React.ReactNode;
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
export class ErrorBoundary extends Component<
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
    // captureException(error, { extra: errorInfo as unknown as Extras });
    console.error(error, errorInfo);
  }

  render() {
    const { error } = this.state;
    const { fallbackComponent: FallbackComponent } = this.props;
    if (error !== null) {
      return FallbackComponent ? (
        // @ts-ignore ??
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
