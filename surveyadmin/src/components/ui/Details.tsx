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
      <p>{children}</p>
    </details>
  );
};

export default Details;
