import type { PermissionSchema } from "@devographics/permissions";
// NEW VERSION without Vulcan

// instead of one big schema,
// define smaller schema per use-case: permission, validation...
// it makes it easier to swap technologies

type ValidationSchema = {
  [key: string]: {
    type: "string" | "date" | "number" | "boolean";
    optional?: boolean;
  };
};
export const validationSchema: ValidationSchema = {
  // default properties
  _id: {
    type: "string",
    optional: true,
  },
  createdAt: {
    type: "date",
    optional: true,
  },
  updatedAt: {
    type: "date",
    optional: true,
  },
  // unlike updatedAt, this tracks when the user clicked "submit" on the client,
  // not when the server finished the update
  lastSavedAt: {
    type: "date",
    optional: true,
  },
  // tracks the most recent time the user reached the end of the survey
  finishedAt: {
    type: "date",
    optional: true,
  },
  /**
   * NOTE: this userId is only present in Response
   * It is removed in the NormalizedResponse that can be made public
   */
  userId: {
    type: "string",
    optional: true,
    /*
        relation: {
          fieldName: "user",
          typeName: "User",
          kind: "hasOne",
        },
        */
  },

  // custom properties

  year: {
    type: "number",
    optional: true,
  },
  duration: {
    type: "number",
    optional: true,
  },
  completion: {
    type: "number",
    optional: true,
  },
  knowledgeScore: {
    type: "number",
    optional: true,
  },
  locale: {
    type: "string",
    optional: true,
  },
  isSynced: {
    type: "boolean",
    optional: true,
  },
  emailHash: {
    type: "string",
    optional: true,
  },
  isSubscribed: {
    type: "boolean",
    optional: true,
  },
  // @depreacted Prefer surveyId
  context: {
    type: "string",
    optional: true,
  },
  // @deprecated Prefer editionId
  surveySlug: {
    type: "string",
    optional: true,
  },
  // state_of_js (in old surveys, it was sometimes the editionId, but not anymore)
  surveyId: {
    type: "string",
    optional: true,
  },
  // js2022
  editionId: {
    type: "string",
    optional: true,
  },
  isNormalized: {
    type: "boolean",
    optional: true,
  },
  /*
    NOTE: this field will exist in the database, but is only used in the admin area
    Currently (09/2022) the admin area doesn't use this field but instead rely on a virtual field with a
    "reversed relation" to get the normalizedResponse from a response
    However the normalization adds this field in the db for convenience of future changes
    normalizedResponseId: {
      type: "string",
      optional: true,
      canRead: ["admins"],
      canCreate: ["admins"],
      canUpdate: ["admins"],
    },
    */
  isFinished: {
    type: "boolean",
    optional: true,
  },
  common__user_info__authmode: {
    type: "string",
    optional: true,
  },
  common__user_info__device: {
    type: "string",
    optional: true,
  },
  common__user_info__browser: {
    type: "string",
    optional: true,
  },
  common__user_info__version: {
    type: "string",
    optional: true,
  },
  common__user_info__os: {
    type: "string",
    optional: true,
  },
  common__user_info__referrer: {
    type: "string",
    optional: true,
  },
  common__user_info__source: {
    type: "string",
    optional: true,
  },
};

export const responseRestrictedFields = [];
export const responsePermissionSchema: PermissionSchema = {
  _id: {
    canRead: ["owner"],
  },
  createdAt: {
    canRead: ["owner"],
  },
  updatedAt: {
    canRead: ["owner"],
  },
  lastSavedAt: {
    canRead: ["owners"],
    // allow update from client-side, is it what we want?
    canCreate: ["member"],
    canUpdate: ["owner"],
  },
  /**  tracks the most recent time the user reached the end of the survey */
  finishedAt: {
    canRead: ["owner"],
  },
  userId: {
    canRead: ["owner"],
  },
  // survey year
  year: {
    canRead: ["owner"],
  },
  duration: {
    canRead: ["owners"],
  },
  completion: {
    canRead: ["owner"],
  },
  knowledgeScore: {
    canRead: ["owner"],
  },
  locale: {
    canRead: ["owner"],
  },
  isSynced: {},
  emailHash: {
    canRead: ["owner"],
    canCreate: ["member"], // ??
    canUpdate: ["admin"],
  },
  isSubscribed: {
    canRead: ["owner"],
    canCreate: ["member"],
    canUpdate: [],
  },
  // @depreacted Prefer surveyId
  context: {
    canRead: ["owner"],
    canCreate: ["member"],
  },
  // @deprecated Prefer editionId
  surveySlug: {
    canRead: ["owner"],
    canCreate: ["member"],
  },
  // state_of_js (in old surveys, it was sometimes the editionId, but not anymore)
  surveyId: {
    canRead: ["owner"],
    canCreate: ["members"],
  },
  // js2022
  editionId: {
    canRead: ["owner"],
    canCreate: ["member"],
  },
  isNormalized: {},
  /*
    NOTE: this field will exist in the database, but is only used in the admin area
    Currently (09/2022) the admin area doesn't use this field but instead rely on a virtual field with a
    "reversed relation" to get the normalizedResponse from a response
    However the normalization adds this field in the db for convenience of future changes
    normalizedResponseId: {
      type: "string",
      optional: true,
      canRead: ["admins"],
      canCreate: ["admins"],
      canUpdate: ["admins"],
    },
    */
  isFinished: {
    canRead: ["owner", "admins"],
    canCreate: ["members"],
    canUpdate: ["members"],
  },
  common__user_info__authmode: {
    canRead: ["owner"],
    canCreate: ["member"],
  },
  common__user_info__device: {
    canRead: ["owner"],
    canCreate: ["member"],
  },
  common__user_info__browser: {
    canRead: ["owner"],
    canCreate: ["member"],
  },
  common__user_info__version: {
    canRead: ["owner"],
    canCreate: ["member"],
  },
  common__user_info__os: {
    canRead: ["owner"],
    canCreate: ["member"],
  },
  common__user_info__referrer: {
    canRead: ["owner"],
    canCreate: ["member"],
  },
  common__user_info__source: {
    canRead: ["owner"],
    canCreate: ["member"],
  },
};
