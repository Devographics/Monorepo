import React from 'react'
import { Redirect, useLocation } from '@reach/router'
import { getBlockTitle, getBlockDescription } from 'core/helpers/blockHelpers'
import { getSiteTitle, mergePageContext } from '../helpers/pageHelpers'
import PageMeta from '../pages/PageMeta'
import PageMetaDebug from '../pages/PageMetaDebug'
import { useI18n } from '@devographics/react-i18n'
import { usePageContext } from 'core/helpers/pageContext'
import { useEntities } from 'core/helpers/entities'

const ShareBlockTemplate = () => {
    const pageContext_ = usePageContext()
    const entities = useEntities()
    const location = useLocation()
    const { getString } = useI18n()
    const pageContext = mergePageContext(pageContext_, location)
    const { block } = pageContext

    const { label: blockTitle } = getBlockTitle({ block, pageContext, getString, entities })
    const blockDescription = getBlockDescription({
        block,
        pageContext,
        getString,
        options: {
            isHtml: false
        }
    })

    let title = `${getSiteTitle({ pageContext })}: ${blockTitle}`

    const overrides = {
        title
    }
    if (blockDescription) {
        overrides.description = blockDescription
    }

    return (
        <div className="template">
            <PageMeta overrides={overrides} />
            <PageMetaDebug overrides={overrides} />
            {!pageContext.isDebugEnabled && <Redirect to={pageContext.redirect} noThrow />}
            Redirecting…
        </div>
    )
}

export default ShareBlockTemplate
