import React from 'react'
import styled from 'styled-components'
import { spacing } from 'core/theme'
import BlockNote from 'core/blocks/block/BlockNote'
import BlockLegends from 'core/blocks/block/BlockLegends'
import { useI18n } from 'core/i18n/i18nContext'
import { usePageContext } from 'core/helpers/pageContext'
import { getBlockDescriptionKey } from 'core/helpers/blockHelpers'
import T from 'core/i18n/T'
import BlockFooter from 'core/blocks/block/BlockFooter'

const BlockChart = (props) => {
    const { children, units, error, data, block = {}, legends, legendProps } = props
    const { legendPosition = 'bottom', showNote = true } = block

    const legendProps_ = { block, data, units, position: legendPosition, legends, ...legendProps }
    
    return (
        <div>
            <BlockDescriptionContents block={block} />

            {legends && legendPosition === 'top' && <BlockLegends {...legendProps_} />}
            <div className="Block__Contents">
                {error ? <div className="error">{error}</div> : children}
            </div>
            {legends && legendPosition === 'bottom' && <BlockLegends {...legendProps_} />}
            <BlockFooter {...props} />
            {showNote && <BlockNote block={block} />}
        </div>
    )
}

const BlockDescriptionContents = ({ block }) => {
    const { translate } = useI18n()
    const context = usePageContext()

    const { description, enableDescriptionMarkdown = true } = block
    const key = `${getBlockDescriptionKey(block, context)}`
    if (description || translate(key, {}, null)) {
        return (
            <Description className="Block__Description">
                <T
                    t={description}
                    k={key}
                    md={enableDescriptionMarkdown}
                    fallback={null}
                    html={true}
                />
            </Description>
        )
    }
    return null
}

const Description = styled.div`
    margin-bottom: ${spacing(1)};

    p {
        &:last-child {
            margin: 0;
        }
    }
`

export default BlockChart
