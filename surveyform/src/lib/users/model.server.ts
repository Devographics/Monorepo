import { UserType as UserTypeShared } from "./model";

export type UserTypeServer = UserTypeShared & { hash?: string; salt?: string };

export const User = {} as any;
