// @see results/src/core/helpers/pageHelpers.ts
import type { StringTranslator } from "@devographics/i18n"
import type { PageDefinition } from "./sitemap"
import type { EditionMetadata } from "@devographics/types"
// TODO: get pages from the sitemap
export const getPageLabelKey = (pageContext: PageDefinition): string =>
    pageContext.titleId || `sections.${pageContext.intlId || pageContext.id}.title`

export const getPageLabel = ({
    survey,
    pageContext,
    t,
    options = { includeWebsite: false }
}: {
    survey: EditionMetadata,
    pageContext: PageDefinition,
    t: StringTranslator
    options?: { includeWebsite?: boolean }
}) => {
    let label

    label = t(getPageLabelKey(pageContext))?.t
    if (options.includeWebsite === true) {
        label = `${survey.survey.name} ${survey.year}: ${label}`
    }

    return label || ''
}