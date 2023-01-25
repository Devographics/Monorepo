"use client";
import React, { useContext } from "react";

const SectionContext = React.createContext<number | undefined>(undefined);

export const SectionProvider = ({
  section,
  children,
}: {
  section: number;
  children: React.ReactNode;
}) => {
  return (
    <SectionContext.Provider value={section}>
      {children}
    </SectionContext.Provider>
  );
};

export const useSection = () => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error("Called useSection before setting SectionProvider context");
  }
  return context;
};
