/**
 * Entity = Person or Organization, with infos and Twitter, Github accounts etc.
 *
 */

export interface EntityResolvedFields {
  homepage?: Resource;
  github?: any;
  npm?: any;
  caniuse?: any;
  mdn?: any;
  mastodon?: any;
  twitter?: any;
  twitch?: any;
  youtube?: any;
  company?: Entity;
  blog?: Resource;
  rss?: Resource;
}

export interface Entity extends EntityResolvedFields {
  id: string;
  belongsTo?: string;
  name: string;
  nameClean?: string;
  nameHtml?: string;
  category?: string;
  description?: string;
  descriptionClean?: string;
  descriptionHtml?: string;
  tags?: string[];
  patterns?: string[];
  normalizationOnly?: boolean;

  homepageUrl?: string;
  blogUrl?: string;
  rssUrl?: string;
  mastodonName?: string;
  twitterName?: string;
  twitchName?: string;
  youtubeName?: string;
  youtubeUrl?: string;
  companyName?: string;

  example?: Example;
  apiOnly?: boolean;
}

export interface Resource {
  name?: string;
  url: string;
}

export interface Example {
  language: string;
  code: string;
  codeHighlighted: string;
}
