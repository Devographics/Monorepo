/**
 * Processes the sitemap that defines the site structure
 */

// A raw sitemap section as stored in the yaml file, unprocessed
import type { SitemapSection } from "@devographics/types";
import { z } from "zod";

/**
 * The raw yaml structure stored on GitHub
 * It's a zod schema rather than a type,
 * because we parse and validate it
 */
const rawSitemapSchema = z.array(z.object({}))

type BlockType = "SurveyIntroBlock" | "NewsletterBlock" | "TranslatorsBlock" | "TshirtBlock" | "HorizontalBlock"
type TemplateType = "sponsors"
    | "credits"
    | "page_introduction" | "demographics"
    | "hints"
type Units = "count" | "averageByFacet"
interface BaseBlockDefinition {
    id: string,
    /** Keep in sync with which file ? */
    template?: TemplateType
    blockType?: BlockType
    defaultUnits?: Units,
    parameters?: {
        limit?: number,
        cutoff?: number
        // for demographics template
        showNoAnswer?: boolean
    }
}

/**
 * A processed sitemap section, to be used in the result app
 * (@devographis/types only expose the raw sitemap type that can be used by other apps)
 * 
 * TODO: work in progress
 * It's actually the type of a raw sitemap
 * A sitemap may have more fields,
 * we'll see what's actually used in the app later on
 */
export interface PageDefinition {
    /** introduction */
    id: string,
    /** "/" */
    path: string,
    /** 
     * Full title token
     * sections.user_info.description.css2023 */
    titleId?: string
    /**
     * Title token, without the "sections" part
     * @example sections.[intlId] */
    intlId?: string,
    /** If not translated */
    title?: string,
    descriptionId: string,
    blocks: Array<
        BaseBlockDefinition & {
            variants?: Array<
                BaseBlockDefinition & {
                    fieldId: string,
                    tabId: string,
                    descriptionId: string,
                    i18nNamespace: string,
                    filterState: {
                        options: {
                            showDefaultSeries: boolean,
                            enableYearSelect: boolean,
                            mode: "grid",
                            queryOnLoad: boolean,
                            supportedModes: Array<"grid" | "facet" | "combined">,
                            preventQuery: boolean

                        }
                    }
                    filters: Array<{
                        conditons: Array<{
                            fieldId: "string",
                            sectionId: string,
                            operator: "in",
                            /** ["range_0_10", "range_10_30"] */
                            value: Array<string>

                        }>
                    }>
                }>
        }>
}

/**
 * The structure we use to generate the results app
 */
export type Sitemap = Array<PageDefinition>

export function processRawSitemap(rawSitemapYaml: Array<SitemapSection>): Sitemap {
    const rawSitemap = rawSitemapYaml // TODO rawSitemapSchema.parse(rawSitemapYaml)
    return rawSitemap as Sitemap

}
