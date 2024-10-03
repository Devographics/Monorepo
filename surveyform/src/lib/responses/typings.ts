import type { ResponseDocument } from "@devographics/types";
import { UserDocument } from "~/lib/users/typings";

export type UserWithResponses = UserDocument & {
  responses: Array<ResponseDocument>;
};
