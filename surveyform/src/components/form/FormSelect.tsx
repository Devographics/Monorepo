export function FormSelect({
  children,
  className,
  ...rest
}: React.HTMLProps<HTMLSelectElement>) {
  return (
    <select className={["form-select", className].join(" ")} {...rest}>
      {children}
    </select>
  );
}
