import type { DocumentNode, FragmentDefinitionNode } from "graphql";

export const getFragmentName = (f: DocumentNode) => {
  const name = (f?.definitions?.[0] as FragmentDefinitionNode)?.name?.value;
  if (!name)
    throw new Error(`Provided fragment has no name. Check that your fragment is wrapped
  with "gql" and that it's actually a fragment. AST: ${JSON.stringify(f)}`);
  return name;
};
