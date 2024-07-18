// @see results/src/core/helpers/pageHelpers.ts
import type { StringTranslator } from "@devographics/i18n"
import type { PageDefinition } from "./sitemap"
import type { EditionMetadata } from "@devographics/types"
// TODO: get pages from the sitemap
export const getPageLabelKey = (pageDefinition: PageDefinition): string =>
    pageDefinition.titleId || `sections.${pageDefinition.intlId || pageDefinition.id}.title`

export const getPageLabel = ({
    survey,
    pageDefinition,
    t,
    options = { includeWebsite: false }
}: {
    survey: EditionMetadata,
    pageDefinition: PageDefinition,
    t: StringTranslator
    options?: { includeWebsite?: boolean }
}) => {
    let label

    label = t(getPageLabelKey(pageDefinition))?.t
    if (options.includeWebsite === true) {
        label = `${survey.survey.name} ${survey.year}: ${label}`
    }

    return label || ''
}