export function FormFeedback({
  children,
  type,
}: {
  children: React.ReactNode;
  type: "valid" | "invalid";
}) {
  return <div className={`${type}-feedback`}>{children}</div>;
}
