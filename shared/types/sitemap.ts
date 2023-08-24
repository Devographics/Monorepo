import { Entity } from 'entities'

export interface SitemapSectionFields {
    id: string
    titleId: string
    descriptionId: string
    path: string
    blocks?: BlockDefinition[]
}

export interface SitemapSection extends SitemapSectionFields {
    children?: SitemapSectionFields[]
}

export interface BlockDefinitionFields {
    id: string
    fieldId: string
    tabId: string
    titleId: string
    descriptionId: string
    i18nNamespace: string
    template: string
    blockType: string
    parameters: SitemapBlockParameters
    filtersState: any // Assuming JSON maps to a general object type
    year: number
    items?: string[]
    defaultUnits: string
    queryOptions: SitemapBlockQueryOptions
    entity: Entity // Entity type is referenced but not defined in provided GraphQL code. Assuming it exists elsewhere.
}

export interface BlockDefinition extends BlockDefinitionFields {
    variants?: BlockDefinitionFields[]
}

export interface SitemapBlockParameters {
    years?: number[]
    rankCutoff: number
    limit: number
    cutoff: number
    showNoAnswer: boolean
}

export interface SitemapBlockQueryOptions {
    addBucketsEntities: boolean
}
