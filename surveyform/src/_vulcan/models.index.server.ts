// Export all your SERVER-ONLY models here
// Please do not remove the User model, which is necessary for auth
import { Save } from "@devographics/core-models/server";
import { initRedis } from "@devographics/redis";
import { User } from "~/core/models/user.server";
import { Project } from "@devographics/core-models/server";
// Add default connectors and dataSources creators for models that may miss some
// @see https://www.apollographql.com/docs/apollo-server/data/data-sources
// import { addDefaultMongoConnector } from "@vulcanjs/mongo-apollo/server";
import {
  fetchEditionMetadataSurveyForm,
  fetchSurveysMetadata,
} from "@devographics/fetch";
import {
  getResponseModel,
  initResponseModelServer,
} from "~/responses/model.server";
import { VulcanGraphqlModelServer } from "@vulcanjs/graphql/server";
import { serverConfig } from "~/config/server";

let models: Array<VulcanGraphqlModelServer> = [];
export const getServerModels = async () => {
  if (models.length) return models;
  initRedis(serverConfig().redisUrl);
  const surveyList = await fetchSurveysMetadata();
  const editions = await Promise.all(
    surveyList
      .map((survey) => survey.editions)
      .flat()
      .map((edition) => {
        return fetchEditionMetadataSurveyForm({
          surveyId: edition.surveyId,
          editionId: edition.id,
        });
      })
  );
  // @ts-ignore
  initResponseModelServer(editions);
  models = [User, Save, Project, getResponseModel()];
  // addDefaultMongoConnector(models);
  return models;
};
