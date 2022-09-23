/**
 * Entity = Person or Organization, with infos and Twitter, Github accounts etc.
 *
 */
export interface Entity {
  id: string;
  name: string;
  tags?: Array<string>;
  patterns?: any;
  twitterName?: string;
  twitter?: any;
  company?: { homepage: { url: string }; name: string };
  apiOnly?: boolean;
  mdn?: { url: string };
  isCode?: boolean;
  example: Example
}

export interface Example {
  language: string;
  code: string;
}
