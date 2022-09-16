// Export all your SHARED models here
// Please do not remove the User model, which is necessary for auth
import { Response } from "~/modules/responses";
import { Save } from "@devographics/core-models";
import { User } from "~/core/models/user";
const models = [User, Response, Save];
export default models;
