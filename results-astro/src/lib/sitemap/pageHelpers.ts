import type { PageDefinition } from "./sitemap"
// TODO: get pages from the sitemap
export const getPageLabelKey = (pageDefinition: PageDefinition): string =>
    pageDefinition.titleId || `sections.${pageDefinition.intlId || pageDefinition.id}.title`