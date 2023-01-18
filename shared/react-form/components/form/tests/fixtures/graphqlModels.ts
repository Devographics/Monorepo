import { createGraphqlModel } from "@vulcanjs/graphql";
import { VulcanDocument } from "@vulcanjs/schema";

// dummy simplified model
export interface OneFieldType extends VulcanDocument {
  text: string;
  __typename?: "OneField"; // don't forget the typeName in mocks
}
export const OneFieldGraphql = createGraphqlModel({
  name: "OneField",
  schema: {
    _id: {
      type: String,
      canRead: ["anyone"],
      canUpdate: ["anyone"],
      canCreate: ["anyone"],
    },
    text: {
      type: String,
      canRead: ["anyone"],
      canUpdate: ["anyone"],
      canCreate: ["anyone"],
    },
  },
  graphql: {
    typeName: "OneField",
    multiTypeName: "OneFields",
  },
});
