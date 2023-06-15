// @see https://stackoverflow.com/questions/51835611/specify-specific-props-and-accept-general-html-props-in-typescript-react-app
export type ButtonProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  // The any is important here: we allow end-application to "hack" the component with a custom replacement implementation,
  // so we authorize them to  pass additionnal unknown props
  any;
