import React from "react";
// Catches aerror and display correctly
export class ExpectedErrorBoundary extends React.Component<
  any,
  { hasError: boolean; error?: Error }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    console.warn(error);
    // Mettez à jour l'état, de façon à montrer l'UI de repli au prochain rendu.
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // Vous pouvez aussi enregistrer l'erreur au sein d'un service de rapport.
  }
  render() {
    if (this.state.hasError) {
      // Vous pouvez afficher n'importe quelle UI de repli.
      return (
        <div>
          <h2>Everything is fine</h2>
          <p>
            An expected error was caught by the error boundary with message:
          </p>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return (
      <div>
        <p>
          Waiting for an error to be caught... this message should disappear...
        </p>
        <div>{this.props.children}</div>
      </div>
    );
  }
}
