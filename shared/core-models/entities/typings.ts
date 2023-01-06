/**
 * Entity = Person or Organization, with infos and Twitter, Github accounts etc.
 *
 */

export interface Entity {
  id: string
  name: string
  nameClean?: string
  nameHtml?: string
  homepage?: Resource
  category?: string
  description?: string
  descriptionClean?: string
  descriptionHtml?: string
  tags?: string[]
  patterns?: string[]
  normalizationOnly?: boolean

  github?: any
  npm?: any
  caniuse?: any
  mdn?: any

  mastodonName: string
  mastodon: any

  twitterName: string
  twitter: any

  twitchName: string
  twitch: any

  youtubeName: string
  youtubeUrl: string
  youtube: any

  companyName?: string
  company?: Entity

  example?: Example
  apiOnly?: boolean;
}

export interface Resource {
  name: string;
  url: string;
}

export interface Example {
  language: string;
  code: string;
  codeHighlighted: string;
}
