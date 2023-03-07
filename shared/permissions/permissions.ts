// TODO: asses whether we can reenable functions that expects a Vulcan model with another language
// eg a zod schema?
/**
 * Group based permissions
 */
import intersection from "lodash/intersection.js";
//import compact from "lodash/compact.js";
//import map from "lodash/map.js";
//import difference from "lodash/difference.js";
//import get from "lodash/get.js";
//import unset from "lodash/unset.js";
//import cloneDeep from "lodash/cloneDeep.js";
import isEqual from "lodash/isEqual.js";
import { FieldPermissions, PermissionGroup, PermissionDefinition, PermissionDocument, PermissionUser } from "./typings";

/**
 * Any user, connected or not
 */
export const anyoneGroup = "anyone";
/**
 * Visitors that are NOT connected
 */
export const visitorGroup = "visitor";
/**
 * Any connected user
 */
export const memberGroup = "member";
/**
 * Admins
 */
export const adminGroup = "admin";
/**
 * User that owns the current document
 * (document.userId is equal to currentUser._id)
 */
export const ownerGroup = "owner";

////////////////////
// Helpers        //
////////////////////
/**
 * @summary get a list of a user's groups
 *
 * Will include Vulcan dynamic groups
 * @param {Object} user
 */
export const getGroups = (
  user: PermissionUser | null | undefined,
  document?: PermissionDocument | null | undefined
): Array<PermissionGroup> => {
  let userGroups = [
    anyoneGroup,
  ];
  if (user) {
    userGroups.push(memberGroup);
    if (document && owns(user, document)) {
      userGroups.push("owners");
    }
    if (user.groups) {
      // custom groups
      userGroups = userGroups.concat(user.groups);
    }
    if (isAdmin(user)) {
      userGroups.push(adminGroup);
    }
  } else {
    userGroups.push(visitorGroup);
  }

  return userGroups;
};

/**
 * @summary check if a user is a member of a group
 * @param {Array} user
 * @param {String} group or array of groups
 */
export const isMemberOf = (
  user: PermissionUser | null | undefined,
  groupOrGroups: Array<PermissionGroup> | PermissionGroup,
  document?: PermissionDocument | null
) => {
  const groups = Array.isArray(groupOrGroups) ? groupOrGroups : [groupOrGroups];
  return intersection(getGroups(user, document), groups).length > 0;
};

/**
 * Alias for isMemberOf if you want to translate roles into actions
 * @example 
 * const canDoThing = ["admin", "moderator"]
 * canDoAction(user, canDoThing, document)
 */
export const canDo = isMemberOf

/**
 * @summary Check if a user owns a document
 */
export const owns = function (
  user: PermissionUser | null,
  document: PermissionDocument
) {
  if (!user) return false;
  try {
    if (!!document.userId) {
      // isEqual is robust to the scenario where the "_id" is not a string but an ObjectId
      // However, _id is usually expected to be a string
      // @see check https://github.com/VulcanJS/vulcan-npm/issues/63
      return isEqual(user._id, document.userId);
    } else {
      // special-case : the user itself
      return isEqual(user._id, document._id)
    }
  } catch (e) {
    return false;
  }
};

export const isAdmin = function (user: PermissionUser | null | undefined): boolean {
  return !!user?.isAdmin;
};

export const canReadField = function (
  user: PermissionUser | null,
  field: FieldPermissions,
  document?: Object
) {
  const canRead = field.canRead;
  if (!canRead) {
    return false;
  }
  // make all fields readable by admin
  if (isAdmin(user)) {
    return true;
  }
  if (typeof canRead === "function") {
    // if canRead is a function, execute it with user and document passed. it must return a boolean
    return (canRead as Function)(user, document); // TODO: we should not need the explicit case thanks to the typecguard
  } else if (typeof canRead === "string") {
    // if canRead is just a string, we assume it's the name of a group and pass it to isMemberOf
    return (
      // @deprecated
      canRead === "guests" ||
      // new name for "guests"
      canRead === "anyone" ||
      isMemberOf(user, canRead, document)
    );
  } else if (Array.isArray(canRead) && canRead.length > 0) {
    // if canRead is an array, we do a recursion on every item and return true if one of the items return true
    return canRead.some((group) =>
      canReadField(user, { canRead: group }, document)
    );
  }
  return false;
};

/**
 * TODO: how to define a simpler "VulcanModel" just for permissions?
 */
/*
export const getUserReadableFields = function (
  user: PermissionUser | null,
  model: VulcanModel,
  document?: PermissionDocument
) {
  return compact(
    map(model.schema, (field, fieldName) => {
      if (fieldName.indexOf(".$") > -1) return null;
      return canReadField(user, field, document) ? fieldName : null;
    })
  );
};
*/

/**
 * Check if field canRead include a permission that needs to be checked against the actual document and not just from the user
 */
export const isDocumentBasedPermissionField = (
  field: FieldPermissions
) => {
  const canRead = field.canRead;
  if (canRead) {
    if (typeof canRead === "function") {
      return true;
    } else if (canRead === "owners") {
      return true;
    } else if (Array.isArray(canRead) && canRead.length > 0) {
      // recursive call on if canRead is an array
      return canRead.some((group) =>
        isDocumentBasedPermissionField({ canRead: group })
      );
    }
  }
  return false;
};

/**
 * Retrieve fields that needs the document to be already fetched to be checked, and not just the user
 * => owners permissions, custom permissions etc.
 */
/*
export const getDocumentBasedPermissionFieldNames = function (
  model: VulcanModel
) {
  const schema = model.schema;
  const documentBasedFieldNames = Object.keys(schema).filter((fieldName) => {
    if (fieldName.indexOf(".$") > -1) return false; // ignore arrays
    const field = schema[fieldName];
    if (isDocumentBasedPermissionField(field)) return true;
    return false;
  });
  return documentBasedFieldNames;
};
*/

/**
 * @summary Check if a user can access a list of fields
 * @param {Object} user - The user performing the action
 * @param {Object} collection - The collection
 * @param {Object} fields - The list of fields
 */
/*
export const checkFields = (
  user: PermissionUser | null,
  model: VulcanModel,
  fields: Array<any>
) => {
  const viewableFields = getUserReadableFields(user, model);
  // Initial case without document => we ignore fields that need the document to be checked
  const ambiguousFields = getDocumentBasedPermissionFieldNames(model); // these fields need to wait for the document to be present before being checked
  const fieldsToTest = difference(fields, ambiguousFields); // we only check non-ambiguous fields (canRead: ["guests", "admins"] for instance)
  const diff = difference(fieldsToTest, viewableFields);

  if (diff.length) {
    throw new Error(
      `You don't have permission to filter model ${model.name
      } by the following fields: ${diff.join(
        ", "
      )}. Field is not readable or do not exist.`
    );
  }
  return true;
};
*/

/**
 * Check if user was allowed to filter this document based on some fields
 * @param {Object} user - The user performing the action
 * @param {Object} collection - The collection
 * @param {Object} fields - The list of filtered fields
 * @param {Object} document - The retrieved document
 */
/*
export const canFilterDocument = (
  user: PermissionUser,
  model: VulcanModel,
  fields: Array<string>,
  document: PermissionDocument
) => {
  const viewableFields = getUserReadableFields(user, model, document);
  const diff = difference(fields, viewableFields);
  return !diff.length; // if length is > 0, it means that this document wasn't filterable by user in the first place, based on provided filter, we must remove it
};
*/

/**
 * Remove restricted fields from a  document
 * @param document
 * @param schema
 * @param currentUser
 */
/*
export const restrictDocument = (
  document: PermissionDocument,
  schema: VulcanSchema,
  currentUser: PermissionUser | null
): PermissionDocument => {
  let restrictedDocument = cloneDeep(document);
  forEachDocumentField(
    document,
    schema,
    ({ fieldName, fieldSchema, currentPath, isNested }) => {
      if (isNested && (!fieldSchema || !fieldSchema.canRead)) return; // ignore nested fields without permissions
      if (!fieldSchema || !canReadField(currentUser, fieldSchema, document)) {
        unset(restrictedDocument, `${currentPath}${fieldName}`);
      }
    }
  );
  return restrictedDocument;
};
*/

type ArrayOrSingle<T> = Array<T> | T;
/**
 * @summary For a given document or list of documents, keep only fields viewable by current user
 * @param {Object} user - The user performing the action
 * @param {Object} collection - The collection
 * @param {Object} document - The document being returned by the resolver
 */
/*
export const restrictViewableFields = (
  user,
  model: VulcanModel,
  docOrDocs: ArrayOrSingle<PermissionDocument>
): ArrayOrSingle<PermissionDocument> => {
  if (!docOrDocs) return {};
  const schema = model.schema;
  const restrictDoc = (document) => restrictDocument(document, schema, user);

  return Array.isArray(docOrDocs)
    ? docOrDocs.map(restrictDoc)
    : restrictDoc(docOrDocs);
};
*/

/**
 * @summary For a given of documents, keep only documents and fields viewable by current user (new APIs)
 * @param {Object} user - The user performing the action
 * @param {Object} collection - The collection
 * @param {Object} document - The document being returned by the resolver
 */
/*
export const restrictDocuments = function ({
  user,
  model,
  documents,
}: {
  user: PermissionUser;
  model: VulcanModel;
  documents: Array<PermissionDocument>;
}) {
  const check = get(model, "permissions.canRead");
  let readableDocuments = documents;
  if (check) {
    readableDocuments = documents.filter((document) =>
      canReadDocument({ model, document, user })
    );
  }
  const restrictedDocuments = restrictViewableFields(
    user,
    model,
    readableDocuments
  );
  return restrictedDocuments;
};
*/

/**
 * @summary Check if a user can submit a field
 * @param {Object} user - The user performing the action
 * @param {Object} field - The field being edited or inserted
 */
/*
export const canCreateField = function (
  user: PermissionUser,
  field: Pick<VulcanFieldSchema, "canCreate">
) {
  const canCreate = field.canCreate;
  if (canCreate) {
    if (typeof canCreate === "function") {
      // if canCreate is a function, execute it with user and document passed. it must return a boolean
      return canCreate(user);
    } else if (typeof canCreate === "string") {
      // if canCreate is just a string, we assume it's the name of a group and pass it to isMemberOf
      // note: if canCreate is 'guests' then anybody can create it
      return (
        canCreate === "guests" ||
        canCreate === "anyone" ||
        isMemberOf(user, canCreate)
      );
    } else if (Array.isArray(canCreate) && canCreate.length > 0) {
      // if canCreate is an array, we do a recursion on every item and return true if one of the items return true
      return canCreate.some((group) =>
        canCreateField(user, { canCreate: group })
      );
    }
  }
  return false;
};
*/

/** @function
 * Check if a user can edit a field
 * @param {Object} user - The user performing the action
 * @param {Object} field - The field being edited or inserted
 * @param {Object} document - The document being edited or inserted
 */
export const canUpdateField = function (
  user: PermissionUser,
  field: FieldPermissions,
  document: PermissionDocument
) {
  const canUpdate = field.canUpdate;

  if (canUpdate) {
    if (typeof canUpdate === "function") {
      // if canUpdate is a function, execute it with user and document passed. it must return a boolean
      return canUpdate(user, document);
    } else if (typeof canUpdate === "string") {
      // if canUpdate is just a string, we assume it's the name of a group and pass it to isMemberOf
      // note: if canUpdate is 'guests' then anybody can create it
      return (
        canUpdate === "guests" ||
        canUpdate === "anyone" ||
        isMemberOf(user, canUpdate, document)
      );
    } else if (Array.isArray(canUpdate) && canUpdate.length > 0) {
      // if canUpdate is an array, we look at every item and return true if one of the items return true
      return canUpdate.some((group) =>
        canUpdateField(user, { canUpdate: group }, document)
      );
    }
  }
  return false;
};

/** @function
 * Check if a user passes a permission check
 *
 * Breaking change compared to Vulcan Meteor: now if the permission
 * check is a function, it also applies to the admin (previously, admins would bypass all checks)
 *
 *
 * @param {Object} check - The permission check being tested
 * @param {Object} user - The user performing the action
 * @param {Object} document - The document being edited or inserted
 */
export const permissionCheck = (
  options: {
    check: PermissionDefinition
    user: PermissionUser,
    document: PermissionDocument
  }
) => {
  const { check, user, document } = options;
  if (typeof check === "function") {
    return check(user, document);
  } else if (isAdmin(user)) {
    // admins always pass all permission checks
    return true;
  } else if (Array.isArray(check)) {
    return isMemberOf(user, check, document);
  } else if (typeof check === "string") {
    return isMemberOf(user, [check], document);
  } else {
    return false;
  }
};

// TODO: adapt to modelsoptions
/*
interface CanActionOnDocumentOptions {
  model: VulcanModel;
  document: PermissionDocument;
  user: PermissionUser;
}
export const canReadDocument = (options: CanActionOnDocumentOptions) => {
  const { model } = options;
  const check = get(model, "permissions.canRead");
  if (!check) {
    // eslint-disable-next-line no-console
    console.warn(
      `Users.canReadDocument() was called but no [canRead] permission was defined for model [${model.name}]`
    );
  }
  return (
//    check && permissionCheck({ ...options, check /*, operationName: "read"*/
//  );
//};
//export const canCreateDocument = (options: CanActionOnDocumentOptions) => {
//  const { model } = options;
//  const check = get(model, "permissions.canCreate");
//  if (!check) {
//    // eslint-disable-next-line no-console
//    console.warn(
//      `canCreateDocument() was called but no [canCreate] permission was defined for model [${model.name}]`
//    );
//  }
//  return (
//    check &&
//    permissionCheck({ ...options, check /*, operationName: "create"*/ })
//  );
//};

//export const canUpdateDocument = (options: CanActionOnDocumentOptions) => {
//  const { model } = options;
//  const check = get(model, "permissions.canUpdate");
//  if (!check) {
//    // eslint-disable-next-line no-console
//    console.warn(
//      `canUpdateDocument() was called but no [canUpdate] permission was defined for model [${model.name}]`
//    );
//  }
//  return (
//    check &&
//    permissionCheck({ ...options, check /*, operationName: "update"*/ })
//  );
//};
//export const canDeleteDocument = (options: CanActionOnDocumentOptions) => {
//  const { model } = options;
//  const check = get(model, "permissions.canDelete");
//  if (!check) {
//    // eslint-disable-next-line no-console
//    console.warn(
//      `canDeleteDocument() was called but no [canDelete] permission was defined for model [${model.name}]`
//    );
//  }
//  return (
//    check &&
//    permissionCheck({ ...options, check /*, operationName: "delete"*/ })
//  );
//};