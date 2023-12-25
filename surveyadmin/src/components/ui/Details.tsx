"use client";

import { ReactNode } from "react";

export const Details = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  return (
    <details>
      <summary>{label}</summary>
      <div>{children}</div>
    </details>
  );
};

export default Details;
