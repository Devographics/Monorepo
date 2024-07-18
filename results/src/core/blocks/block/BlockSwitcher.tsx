import React from 'react'
// import globalBlockRegistry from 'core/helpers/blockRegistry'
import blockRegistry from 'Config/blocks'
import isEmpty from 'lodash/isEmpty'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockError } from 'core/blocks/block/BlockError'
import { getBlockSeriesData } from 'core/helpers/data'
import { BlockVariantDefinition } from 'core/types'
import { getAllQuestions } from 'core/helpers/options'
import { DataSeries } from 'core/filters/types'
import { CustomVariant } from 'core/filters/helpers'

interface BlockSwitcherProps {
    block: BlockVariantDefinition
    blockIndex: number
    variantIndex: number
    pageData?: any
    index?: number
    series?: DataSeries<any>
    variant?: CustomVariant
}
const BlockSwitcher = ({
    pageData,
    block,
    index,
    series: series_,
    variant,
    isLoading
}: BlockSwitcherProps) => {
    const pageContext = usePageContext()
    const { id, blockType, filtersState, query } = block

    if (!blockRegistry[blockType]) {
        console.log(blockType)
        console.log(blockRegistry)
        console.log(block)
        return (
            <BlockError
                block={block}
                message={`Missing Block Component! Block ID: ${id} | type: ${blockType}`}
                errorCode={{ block }}
            />
        )
    }
    const BlockComponent = blockRegistry[blockType]

    const question = getAllQuestions(pageContext.currentEdition).find(
        q => q.id === (block.fieldId ?? block.id)
    )
    const series = series_ || getBlockSeriesData({ block, pageContext, filtersState })

    const blockProps = {
        block,
        question,
        pageData,
        index,
        pageContext,
        // backwards-compatibility
        context: pageContext,
        BlockComponent,
        series,
        variant,
        data: series?.[0]?.data // backwards-compatibility
    }

    if (query && (!series || isEmpty(series) || series.length === 0 || !series[0].data)) {
        return (
            <BlockError
                block={block}
                message={`No available data for block ${id} | path(s): ${series
                    .map(s => s.dataPath)
                    .join(', ')} | type: ${blockType}`}
            >
                <textarea readOnly value={JSON.stringify(pageData, undefined, 2)} />
            </BlockError>
        )
    }

    return <BlockComponent {...blockProps} />
}

export default BlockSwitcher
