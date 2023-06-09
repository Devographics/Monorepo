export interface NormalizedResponseDocument extends ResponseDocument {
  responseId: ResponseDocument["_id"];
  generatedAt: Date;
  survey: SurveyEdition["context"];
  year: SurveyEdition["year"];
  user_info: {
    country?: string;
    // Here, we store only PUBLIC data
    // email?: string;
    // hash?: string;
    // github_username?: string;
    // twitter_username?: string;
  };
}
