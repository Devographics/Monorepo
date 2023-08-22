export type MosaicConfig = Readonly<{
    thumb_width: number
    thumb_height: number
    columns: number
    background: number
}>

/**
 * Config file from the Gatsby app "results/surveys/css2022/config.yml"
 * Or a config defined locally in "./config/config.yml"
 */
export type CaptureConfig = Readonly<{
    baseUrl: string
    /**
     * Absolute path to the sitemap
     * OR
     * path relative to the config file
     */
    sitemap: string
    mosaic: MosaicConfig
}>

export type SitemapBlock = Readonly<{
    id: Readonly<string>
    disableExport?: Readonly<boolean>
    variants: Readonly<BlockVariant[]>
}>

export type BlockVariant = Readonly<{
    id: Readonly<string>
    disableExport?: Readonly<boolean>
}>

export type SitemapPage = Readonly<{
    id: string
    path: string
    blocks?: SitemapBlock[]
    children?: SitemapPage[]
}>

// `sitemap.yml` (VS `raw_sitemap.yml`)
// types only cover what's being used for capturing.
export type Sitemap = Readonly<{
    locales: { id: string }[]
    contents: SitemapPage[]
}>
