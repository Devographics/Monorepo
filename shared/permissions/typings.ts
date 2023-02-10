/**
 * Default groups available in permissions package
 * You can also create your own custom groups by using plain strings
 */
export type PermissionGroup =
  /** Literally anyone, logged in or not */
  | "anyone"
  /**
   * Not logged in users (excluding members)
   */
  | "visitor"
  /** Logged in users */
  | "member"
  /** User whose _id matches the document userId special field */
  | "owner"
  /** Users with isAdmin set to true */
  | "admin"
  | string;

/**
 * To use the permission package, 
 * your users should have a "groups" array
 * and an isAdmin boolean for special super-admin role
 * 
 */
export interface PermissionUser {
  // minimal fields for the User model
  groups: Array<PermissionGroup>;
  isAdmin?: boolean;
  _id?: string;
}


/**
 * To use the permission package ownership features,
 * your documents should have a "userId" array
 * 
 * Permission definitions are tied to the model,
 * not to each document, 
 * so here we track only the userId that is document-specific 
 */
export interface PermissionDocument {
  userId?: string | null | undefined
  _id?: string;
}


type PermissionGroupString = string

export type PermissionChecker = (
  user: PermissionUser | null | undefined,
  document?: PermissionDocument
) => boolean | Promise<boolean>;
export type PermissionDefinition = PermissionGroupString | PermissionChecker

export interface FieldPermissions {
  canRead?: PermissionDefinition | Array<PermissionDefinition>;
  canCreate?: PermissionDefinition | Array<PermissionDefinition>;
  canUpdate?: PermissionDefinition | Array<PermissionDefinition>;

}