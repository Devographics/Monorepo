import React from 'react'
import { usePageContext } from '../helpers/pageContext'
import Debug from '../components/Debug'
import { getPageSocialMeta } from '../helpers/pageHelpers'
import { useI18n } from '@devographics/react-i18n'
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
        if (!key) {
            console.warn('No key for meta.content', meta.content)
            return acc
        }
        return {
            ...acc,
            [key]: meta.content
        }
    }, {})

    return <Debug title="Page meta" data={metaObject} />
}

export default PageMetaDebug
