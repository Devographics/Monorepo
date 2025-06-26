import T from 'core/i18n/T'
import { formatUnitValue } from 'core/charts/common2/helpers/format'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockVariantDefinition } from 'core/types'
import React from 'react'
import './FigureBlock.scss'

export const FigureBlock = ({ block }: { block: BlockVariantDefinition }) => {
    const context = usePageContext()
    const { currentEdition } = context
    const { variables } = block
    const { value, unit } = variables
    const formattedValue = formatUnitValue(value, unit)
    return (
        <div className="figure-block">
            <div className="figure-block-number">{formattedValue}</div>

            <div className="figure-block-text">
                <T k={`figure.${block.id}.${currentEdition.id}`} />
            </div>
        </div>
    )
}

export default FigureBlock
