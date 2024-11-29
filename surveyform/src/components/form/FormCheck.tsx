export function FormCheck({
  children,
  className,
  type,
  ...rest
}: { type: "checkbox" | "radio" } & React.HTMLProps<HTMLDivElement>) {
  return (
    <div className={["form-check", className].join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function FormCheckLabel({
  children,
  className,
  ...rest
}: { children: React.ReactNode } & React.HTMLProps<HTMLLabelElement>) {
  return (
    <label
      className={[className || "", "form-check-label"].join(" ")}
      {...rest}
    >
      {children}
    </label>
  );
}

export function FormCheckInput({
  className,
  ...rest
}: React.HTMLProps<HTMLInputElement>) {
  return (
    <input className={["form-check-input", className].join(" ")} {...rest} />
  );
}
