// Export all your SHARED models here
// Please do not remove the User model, which is necessary for auth
import { Save } from "@devographics/core-models";
import { User } from "~/core/models/user";
// Response is not listed client-side, you need to access it on the fly using getSurveyResponseModel
const models = [User, Save];
export default models;

