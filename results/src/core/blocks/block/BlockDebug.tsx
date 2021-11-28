import React from 'react'
import styled from 'styled-components'

import { useI18n } from 'core/i18n/i18nContext'
import { getBlockMeta } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { spacing } from 'core/theme'

const BlockDebug = ({ block, data }) => {
    return (
        <div>
            debug
            <pre className="error error-data">
                <code>{JSON.stringify(data, undefined, 2)}</code>
            </pre>
        </div>
    )
}

export default BlockDebug
