"use client";

import { useProjects } from "~/lib/projects/hooks";
import { AutocompleteMultiple } from "./AutocompleteMultiple";

export const Projects = (props: any) => {
  return <AutocompleteMultiple {...props} loadDataHook={useProjects} />;
};

export default Projects;
