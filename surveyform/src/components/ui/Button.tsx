// @see https://stackoverflow.com/questions/51835611/specify-specific-props-and-accept-general-html-props-in-typescript-react-app
export type ButtonProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: "primary";
  className?: string;
} & any; // so we authorize them to  pass additionnal unknown props // The any is important here: we allow end-application to "hack" the component with a custom replacement implementation,
export const Button = ({ variant, className, ...rest }: ButtonProps) => (
  <button
    className={[
      className,
      // we still use bootstrap styles
      "btn",
      variant === "primary" ? "btn-primary" : "",
    ].join(" ")}
    {...rest}
  />
);
