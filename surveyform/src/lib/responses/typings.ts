import type { ResponseDocument } from "@devographics/types";
import { UserDocument } from "~/account/user/typings";

export type UserWithResponses = UserDocument & {
  responses: Array<ResponseDocument>;
};
