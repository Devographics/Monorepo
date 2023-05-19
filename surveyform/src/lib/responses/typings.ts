import { ResponseDocument } from "@devographics/core-models";
import { UserDocument } from "~/account/user/typings";

export type UserWithResponses = UserDocument & {
    responses: Array<ResponseDocument>
}