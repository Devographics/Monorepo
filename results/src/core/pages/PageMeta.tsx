import React from 'react'
import Helmet from 'react-helmet'
import { usePageContext } from '../helpers/pageContext'
import { useI18n } from '../i18n/i18nContext'
import { getPageSocialMeta } from '../helpers/pageHelpers'

const PageMeta = ({ overrides = {} }) => {
    const pageContext = usePageContext()
    const { getString } = useI18n()

    const meta = getPageSocialMeta({ pageContext, getString, overrides })

    return <Helmet meta={meta} />
}

export default PageMeta
