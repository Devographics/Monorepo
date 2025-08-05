import React from 'react'
import { getPageLabel } from 'core/helpers/pageHelpers'
import { useI18n } from '@devographics/react-i18n'
import { PageContextValue } from 'core/types'
// import { useTools } from 'core/helpers/toolsContext'

const PageLabel = ({
    page,
    includeWebsite
}: {
    page: PageContextValue
    includeWebsite?: boolean
}) => {
    const { getString } = useI18n()
    // const { getToolName } = useTools()
    const { key, label } = getPageLabel({
        pageContext: page,
        getString,
        options: { includeWebsite }
    })
    return (
        <span className="pagination-link-label" key={key}>
            {label}
        </span>
    )
}

export default PageLabel
