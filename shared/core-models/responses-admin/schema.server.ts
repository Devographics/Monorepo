import { VulcanGraphqlSchemaServer } from "@vulcanjs/graphql/server";
import { schema as schemaCommon } from "./schema";
import { extendSchemaServer } from "../schemaUtils";

export const schema: VulcanGraphqlSchemaServer = extendSchemaServer(
  schemaCommon,
  {
    // previously in API schema
    // TODO: syntax is probably wrong
    pagePath: {
      type: String,
      canRead: ["owners"],
      optional: true,
    },
    // TODO: for those "resolved from document" fields, only the resolveAs part matter
    // we should improve this scenario in Vulcan Next (previously was handled via apiSchema in Vulcan,
    // but we need something more integrated into the schema)
    survey: {
      type: Object,
      typeName: "Survey",
      blackbox: true,
      optional: true,
      canRead: ["owners"],
    },

    knowledgeRanking: {
      type: Number,
      canRead: ["owners"],
      optional: true,
      typeName: "Int",
    },
  }
);

export default schema;
