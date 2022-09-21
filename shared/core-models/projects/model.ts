import schema from "./schema";
import {
  createGraphqlModel,
  CreateGraphqlModelOptionsShared,
} from "@vulcanjs/graphql";

export const projectModelDefinition: CreateGraphqlModelOptionsShared = {
  name: "Project",
  schema,
  graphql: {
    typeName: "Project",
    multiTypeName: "Projects",
  },

  permissions: {
    canRead: ["guests"],
  },
};
export const Project = createGraphqlModel(projectModelDefinition);

export type ProjectDocument = any;
