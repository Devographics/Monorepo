// @see https://stackoverflow.com/questions/51835611/specify-specific-props-and-accept-general-html-props-in-typescript-react-app

type NativeProps =
  | React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
  | React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >;

export type ButtonProps = NativeProps & {
  variant?: "primary";
  className?: string;
} & any; // so we authorize them to  pass additionnal unknown props // The any is important here: we allow end-application to "hack" the component with a custom replacement implementation,

export const Button = ({ variant, className, ...rest }: ButtonProps) => {
  const classes = [
    className,
    // we still use bootstrap styles
    "btn",
    variant === "primary" ? "btn-primary" : "",
  ].join(" ");

  if (rest.href) {
    // if href is present, we render an anchor tag
    return <a className={classes} {...rest} />;
  }

  return <button className={classes} {...rest} />;
};
