import { ReactNode } from "react";

export const CenteredContainer = ({ children }: { children: ReactNode }) => (
  <div style={{ margin: "auto", padding: "64px", textAlign: "center" }}>
    {children}
  </div>
);
