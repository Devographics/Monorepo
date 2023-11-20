import React from 'react'
import PropTypes from 'prop-types'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from 'core/i18n/i18nContext'
import { getBlockMeta } from 'core/helpers/blockHelpers'
import Debug from '../components/Debug'

const ShareBlockDebug = ({ block }) => {
    const pageContext = usePageContext()
    const { getString } = useI18n()

    if (!pageContext.isDebugEnabled) return null

    const meta = getBlockMeta({ block, pageContext, getString })
    return <Debug title="Block sharing" data={meta} />
}

ShareBlockDebug.propTypes = {
    block: PropTypes.object.isRequired
}

export default ShareBlockDebug
