import moment from "moment";
import { nanoid } from "nanoid";
import { extendSchemaServer } from "../schemaUtils";

import { schema as commonSchema } from "./schema";

export const schema = extendSchemaServer(commonSchema, {
  // MANDATORY when using string ids for a collection instead of ObjectId
  // you have to handle the id creation manually
  _id: {
    onCreate: () => {
      // generate a random value for the id
      const _id = nanoid();
      return _id;
    },
  },
  createdAt: {
    onCreate: () => {
      return new Date();
    },
  },
  host: {
    onCreate: () => {
      // TODO: get from Next.js settings
      //return getSetting("host");
    },
  },
  duration: {
    onCreate: ({ data }) => {
      return moment(data.finishedAt).diff(moment(data.startedAt));
    },
  },
});
