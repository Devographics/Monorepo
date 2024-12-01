import { Button, ButtonProps } from "./Button";

const CloseButton = (
  props: ButtonProps & { variant?: "danger" | "warning" }
) => {
  return (
    <Button
      {...props}
      aria-label="Close"
      className={[
        "btn-close",
        props.variant ? `btn-close-${props.variant}` : "",
      ].join(" ")}
    />
  );
};
export const Alert = ({
  children,
  variant = "danger",
  dismissible = false,
  className,
  show = true,
  onClose,
  ...rest
}: {
  dismissible?: boolean;
  show?: boolean;
  variant?: "danger" | "warning";
  onClose?: () => void;
} & React.HTMLProps<HTMLDivElement>) => {
  if (!show) return null;
  return (
    <div
      role="alert"
      className={[
        className,
        "alert",
        `alert-${variant}`,
        dismissible ? "alert-dismissible" : "",
      ].join(" ")}
      {...rest}
    >
      {dismissible && <CloseButton onClick={onClose} />}
      {children}
    </div>
  );
};
