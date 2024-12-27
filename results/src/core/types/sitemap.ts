import { BlockVariantDefinition } from './block'

/**
 * Page definition from the yaml raw sitemap
 * TODO: might be slightly incorrect work in progress
 */
export interface RawPageDef {
    id: string
    i18nNamespace?: string
    path: string
    showTitle?: boolean
    /**
     * TODO: not sure if this is the  raw yml structure or if it also include parsed fields
     */
    block?: Array<BlockVariantDefinition>
    blocks?: Array<BlockVariantDefinition>
    // TODO: might be more more fields here

    is_hidden?: boolean

    pageIndex?: number
    defaultBlockType?: any
}
/**
 * See recent yaml raw sitemap for the structure definition
 * results/surveys/js2022/config/raw_sitemap.yml
 */
export type RawSitemap = Array<RawPageDef>

/**
 * Parsed page definition
 */
export interface PageDef extends RawPageDef {
    parent: PageDef
    children?: Array<PageDef> | any
    previous?: PageDef
    next?: PageDef
    data?: any
}

// TODO
export type Sitemap = Array<PageDef>
