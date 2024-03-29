"use client";
import { EditionMetadata } from "@devographics/types";
import { createContext, ReactNode, useContext } from "react";

interface EditionContextType {
  edition: EditionMetadata;
  /** [state-of-js, 2019] */
  editionPathSegments: Array<string>;
  /** /state-of-js/2019 */
  editionHomePath: string;
  // state-of-js
  surveySlug: string;
  // 2019
  editionSlug: string;
}
const EditionContext = createContext<EditionContextType | undefined>(undefined);

export const EditionProvider = ({
  edition,
  editionPathSegments,
  editionHomePath,
  surveySlug,
  editionSlug,
  children,
}: EditionContextType & {
  children: ReactNode;
}) => {
  return (
    <EditionContext.Provider
      value={{
        edition,
        editionPathSegments,
        editionHomePath,
        surveySlug,
        editionSlug,
      }}
    >
      {children}
    </EditionContext.Provider>
  );
};

/**
 * @returns The survey definition WITHOUT REACT COMPONENTS
 */
export const useEdition = (): EditionContextType => {
  const context = useContext(EditionContext);
  if (!context) {
    throw new Error("Called useEdition before setting EditionProvider context");
  }
  return context;
};

/**
 * Use when you legitimately not sure there is an Edition
 * for instance in layouts
 */
export const useEditionMaybe = () => {
  const context = useContext(EditionContext);
  return context;
};
