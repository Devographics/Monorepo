import { createEmailHash } from "~/lib/email";
import {
  getUsersCollection,
  getNormResponsesCollection,
  getRawResponsesCollection,
} from "@devographics/mongo";
import { UserDocument } from "./typings";

export const deleteComment = async ({ email, reallyDelete = 0 }) => {};

deleteComment.args = ["commentId"];

deleteComment.description = `Delete a specific comment `;

deleteComment.category = "migrations";
