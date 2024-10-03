import { UserDocument as UserTypeShared } from "./typings";

export type UserTypeServer = UserTypeShared & { hash?: string; salt?: string };

export const User = {} as any;
