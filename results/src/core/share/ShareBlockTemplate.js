import React from 'react'
import { Redirect, useLocation } from '@reach/router'
import { getBlockTitle, getBlockDescription } from 'core/helpers/blockHelpers'
import { getSiteTitle, mergePageContext } from '../helpers/pageHelpers'
import PageMeta from '../pages/PageMeta'
import PageMetaDebug from '../pages/PageMetaDebug'
import { useI18n } from 'core/i18n/i18nContext'
import { usePageContext } from 'core/helpers/pageContext'
import { useEntities } from 'core/helpers/entities'

const ShareBlockTemplate = () => {
    const pageContext = usePageContext()
    const entities = useEntities()
    const { block } = pageContext
    const location = useLocation()
    const { translate } = useI18n()
    const context = mergePageContext(pageContext, location)

    const blockTitle = getBlockTitle(block, context, translate, entities)
    const blockDescription = getBlockDescription(context.block, context, translate, {
        isMarkdownEnabled: false
    })
    const overrides = {
        title: `${getSiteTitle(pageContext)}: ${blockTitle} ${pageContext.currentEdition.hashtag}`
    }
    if (blockDescription) {
        overrides.description = blockDescription
    }

    return (
        <div className="template">
            <PageMeta overrides={overrides} />
            <PageMetaDebug overrides={overrides} />
            {!context.isDebugEnabled && <Redirect to={context.redirect} noThrow />}
            Redirecting…
        </div>
    )
}

export default ShareBlockTemplate
