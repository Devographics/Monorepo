import { VulcanGraphqlSchema } from "@vulcanjs/graphql";

export const schema: VulcanGraphqlSchema = {
  // default properties

  _id: {
    type: String,
    optional: true,
    canRead: ["guests"],
  },
  createdAt: {
    type: Date,
    optional: true,
    canRead: ["admins"],
  },
  startedAt: {
    type: Date,
    optional: true,
    canCreate: ["members"],
    canRead: ["admins"],
  },
  finishedAt: {
    type: Date,
    optional: true,
    canCreate: ["members"],
    canRead: ["admins"],
  },
  host: {
    type: String,
    optional: true,
    canRead: ["admins"],
  },
  duration: {
    type: Number,
    optional: true,
    canRead: ["admins"],
  },
  isError: {
    type: Boolean,
    optional: true,
    canCreate: ["members"],
    canRead: ["admins"],
  },
  responseId: {
    type: String,
    optional: true,
    canCreate: ["members"],
    canRead: ["admins"],
  },
};

export default schema;
