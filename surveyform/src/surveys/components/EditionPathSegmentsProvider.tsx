"use client";
import { createContext, ReactNode, useContext } from "react";

const EditionPathSegmentsContext = createContext<Array<string> | undefined>(
  undefined
);

export const EditionPathSegmentsProvider = ({
  editionPathSegments,
  children,
}: {
  /** [state-of-js, 2019] */
  editionPathSegments: Array<string>;
  children: ReactNode;
}) => {
  return (
    <EditionPathSegmentsContext.Provider value={editionPathSegments}>
      {children}
    </EditionPathSegmentsContext.Provider>
  );
};

/**
 *
 * @returns The survey definition WITHOUT REACT COMPONENTS
 */
export const useEditionPathSegments = (): Array<string> => {
  const context = useContext(EditionPathSegmentsContext);
  if (!context) {
    throw new Error(
      "Called useEditionPathSegments before setting EditionPathSegmentsProvider context"
    );
  }
  return context;
};
