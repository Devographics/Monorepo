import { UserDocument as UserTypeShared } from "../../account/user/typings";

export type UserTypeServer = UserTypeShared & { hash?: string; salt?: string };

export const User = {} as any;
