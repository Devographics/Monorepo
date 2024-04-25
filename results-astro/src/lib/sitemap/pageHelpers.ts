// @see results/src/core/helpers/pageHelpers.ts
import type { StringTranslator } from "@devographics/i18n"
import type { PageDefinition } from "./sitemap"
import type { EditionMetadata, SurveyMetadata } from "@devographics/types"
import type { PageContextValue } from "@/components/layouts/PageContext"
// TODO: get pages from the sitemap
export const getPageLabelKey = (pageDefinition: PageDefinition): string =>
    pageDefinition.titleId || `sections.${pageDefinition.intlId || pageDefinition.id}.title`

export const getPageLabel = ({
    edition,
    pageDefinition,
    t,
    options = { includeWebsite: false }
}: {
    edition: EditionMetadata,
    pageDefinition: PageDefinition,
    t: StringTranslator
    options?: { includeWebsite?: boolean }
}) => {
    let label

    label = t(getPageLabelKey(pageDefinition))?.t
    if (options.includeWebsite === true) {
        label = `${edition.survey.name} ${edition.year}: ${label}`
    }

    return label || ''
}

export const getSiteTitle = ({ edition }: { edition: EditionMetadata }) =>
    `${edition.survey.name} ${edition.year}`