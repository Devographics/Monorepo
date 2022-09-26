/**
 * Entity = Person or Organization, with infos and Twitter, Github accounts etc.
 *
 */

export interface Entity {
  id: string
  name: string
  homepage?: string
  category?: string
  description?: string
  tags?: string[]
  patterns?: string[]
  normalizationOnly?: boolean

  github?: any
  npm?: string
  caniuse?: string
  mdn?: string

  twitterName: string
  twitter: any

  companyName?: string
  company?: Entity

  example?: Example
}


export interface Example {
  language: string;
  code: string;
  codeHighlighted: string;
}
