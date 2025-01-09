/**
 * Entity = Person or Organization, with infos and Twitter, Github accounts etc.
 *
 */

import {
    EditionMetadata,
    OptionMetadata,
    QuestionMetadata,
    SectionMetadata,
    SurveyMetadata
} from './metadata'

export interface EntityResolvedFields {
    homepage?: Resource
    github?: any
    npm?: any
    w3c?: any
    caniuse?: any
    mdn?: any
    mastodon?: any
    twitter?: any
    twitch?: any
    youtube?: any
    company?: Entity
    blog?: Resource
    rss?: Resource
    webFeature?: WebFeature
    appearsIn?: EntityAppearance[]
    bluesky?: any
    threads?: any
}

export interface Entity extends EntityResolvedFields {
    id: string
    idAliases?: string[]
    parentId?: string
    belongsTo?: string
    name: string
    nameClean?: string
    nameHtml?: string
    alias?: string
    category?: string
    description?: string
    descriptionClean?: string
    descriptionHtml?: string
    tags?: string[]
    patterns?: string[]
    normalizationOnly?: boolean

    homepageUrl?: string
    blogUrl?: string
    rssUrl?: string
    mastodonName?: string
    twitterName?: string
    twitchName?: string
    youtubeName?: string
    youtubeUrl?: string
    companyName?: string

    example?: Example
    apiOnly?: boolean

    resources?: Resource[]

    avatar?: Avatar

    entityType: EntityType

    webFeaturesId?: string
    webFeature?: WebFeature

    appearsIn: EntityAppearance[]

    threadsId?: string
    blueskyId?: string
}

export type EntityAppearance = {
    survey: SurveyMetadata
    edition: EditionMetadata
    section: SectionMetadata
    question: QuestionMetadata
    option?: OptionMetadata
    as: 'question' | 'option'
}

export enum EntityType {
    PEOPLE = 'people',
    FEATURE = 'feature',
    LIBRARY = 'library',
    DEFAULT = 'default'
}

export interface Avatar {
    url: string
}

export interface Token {
    id: string
    parentId?: string
    tags?: string[]
    patterns?: string[]
    name?: string
    nameClean?: string
    nameHtml?: string
    description?: string
    descriptionClean?: string
    descriptionHtml?: string
}

export interface Resource {
    name?: string
    title?: string
    url: string
}

export interface WebFeature {
    id: string
    compat_features: string[]
    description: string
    description_html: string
    group: string
    name: string
    spec: string[]
    status: WebFeatureStatus
}

export interface WebFeatureStatus {
    baseline: string
    baseline_low_date: string
    support: WebFeatureSupport
}

export interface WebFeatureSupport {
    chrome: string
    chrome_android: string
    edge: string
    firefox: string
    firefox_android: string
    safari: string
    safari_ios: string
}

export interface Example {
    label?: string
    language?: string
    code: string
    codeHighlighted: string
}

export interface MDN {
    locale: string
    url: string
    title: string
    summary: string
}

export interface GitHub {
    id: string
    name: string
    full_name?: string
    description: string
    url: string
    stars: number
    forks?: number
    opened_issues?: number
    homepage: string
}

export interface CanIUse {
    /** URL */
    spec: string
}
