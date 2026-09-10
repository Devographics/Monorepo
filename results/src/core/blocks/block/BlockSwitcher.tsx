import React from 'react'
import surveyBlockRegistry from 'Config/blocks'
import globalBlockRegistry from 'core/blocks/blockRegistry'
import isEmpty from 'lodash/isEmpty'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockError } from 'core/blocks/block/BlockError'
import { getBlockSeriesData } from 'core/helpers/data'
import { BlockVariantDefinition } from 'core/types'
import { getAllQuestions } from 'core/helpers/options'
import { DataSeries } from 'core/filters/types'
import { CustomVariant } from 'core/filters/helpers'

const blockRegistry = { ...globalBlockRegistry, ...surveyBlockRegistry }

interface BlockSwitcherProps {
    block: BlockVariantDefinition
    blockIndex: number
    variantIndex: number
    pageData?: any
    index?: number
    series?: DataSeries<any>
    variant?: CustomVariant
    isCustomVariant?: boolean
}
const BlockSwitcher = ({
    pageData,
    block,
    index,
    series: series_,
    variant,
    isLoading,
    isCustomVariant = false
}: BlockSwitcherProps) => {
    const pageContext = usePageContext()
    const { id, blockType, filtersState, query } = block

    if (!blockRegistry[blockType]) {
        console.log('// Missing block!')
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
    /*
    A query that failed while the site was being built. Without this the block
    would fall through to the generic "No available data" message below, which
    looks the same whether the query was broken or the question simply has no
    results — so a broken query could ship unnoticed.
    */
    const blockError = pageContext.blockErrors?.[id]
    if (blockError) {
        return (
            <BlockError
                block={block}
                message={`Build-time ${blockError.type} error | Block ID: ${id} | ${blockError.message}`}
                errorCode={blockError.errors}
            >
                {blockError.query && <textarea readOnly value={blockError.query} />}
            </BlockError>
        )
    }

    const BlockComponent = blockRegistry[blockType]

    const series = isCustomVariant
        ? series_
        : getBlockSeriesData({ block, pageContext, filtersState })

    const questionId = (series?.[0]?.questionId || block.fieldId) ?? block.id

    const question = getAllQuestions(pageContext.currentEdition).find(q => q.id === questionId)

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
