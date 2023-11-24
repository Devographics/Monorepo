import React from 'react'
import { usePageContext } from '../helpers/pageContext'
import { useI18n } from '../i18n/i18nContext'
import Debug from '../components/Debug'
import { getPageSocialMeta } from '../helpers/pageHelpers'
// import { useTools } from 'core/helpers/toolsContext'

const PageMetaDebug = ({ overrides = {} }) => {
    const pageContext = usePageContext()
    const { getString } = useI18n()
    // const { getToolName } = useTools()

    if (!pageContext.isDebugEnabled) return null

    // const toolName = getToolName(context)
    // if (toolName) {
    //     overrides.title = `${websiteTitle}: ${toolName}`
    // }

    const meta = getPageSocialMeta({ pageContext, getString, overrides })
    const metaObject = meta.reduce((acc, meta) => {
        const key = meta.property || meta.name

        return {
            ...acc,
            [key]: meta.content
        }
    }, {})

    return <Debug title="Page meta" data={metaObject} />
}

export default PageMetaDebug
