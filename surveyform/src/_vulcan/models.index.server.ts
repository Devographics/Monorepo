// Export all your SERVER-ONLY models here
// Please do not remove the User model, which is necessary for auth
import NormalizedResponse from "~/admin/models/normalized_responses/model.server";
import { Response } from "~/modules/responses/model.server";
import { Save } from "@devographics/core-models/server";
import { User } from "~/core/models/user.server";
import { Project } from "~/modules/projects/model.server";
const models = [User, Response, NormalizedResponse, Save, Project];

// Add default connectors and dataSources creators for models that may miss some
// @see https://www.apollographql.com/docs/apollo-server/data/data-sources
import { addDefaultMongoConnector } from "@vulcanjs/mongo-apollo/server";
addDefaultMongoConnector(models);

export default models;
