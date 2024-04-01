import React from 'react'
// import globalBlockRegistry from 'core/helpers/blockRegistry'
import blockRegistry from 'Config/blocks'
import isEmpty from 'lodash/isEmpty'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockError } from 'core/blocks/block/BlockError'
import { getBlockData, getBlockSeriesData } from 'core/helpers/data'
import { BlockDefinition } from 'core/types'
import { CustomizationDefinition } from 'core/filters/types'
import { getAllQuestions } from 'core/helpers/options'

interface BlockSwitcherProps {
    block: BlockDefinition
    pageData?: any
    index?: number
}
const BlockSwitcher = ({
    pageData,
    block,
    blockComponentProps,
    index,
    ...props
}: BlockSwitcherProps) => {
    const pageContext = usePageContext()

    const { id, blockType } = block
    if (!blockRegistry[blockType]) {
        return (
            <BlockError
                block={block}
                message={`Missing Block Component! Block ID: ${id} | type: ${blockType}`}
                errorCode={{ block }}
            />
        )
    }
    const BlockComponent = blockRegistry[blockType]

    const { filtersState } = block

    const question = getAllQuestions(pageContext.currentEdition).find(
        q => q.id === (block.fieldId ?? block.id)
    )

    const blockProps = {
        block,
        question,
        pageData,
        index,
        pageContext,
        // backwards-compatibility
        context: pageContext,
        blockComponentProps,
        BlockComponent
    }
    return <BlockSwitcherWithSeriesData {...blockProps} filtersState={filtersState} />
}

const BlockSwitcherWithSeriesData = (
    props: BlockSwitcherProps & {
        filtersState: CustomizationDefinition
        blockComponent: React.ComponentType<any>
    }
) => {
    const { block, pageData, BlockComponent, pageContext, filtersState, blockComponentProps } =
        props
    const { id, blockType } = block

    const series = getBlockSeriesData({ block, pageContext, filtersState })

    if (block.query && (!series || isEmpty(series) || series.length === 0 || !series[0].data)) {
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

    return <BlockComponent series={series} {...blockComponentProps} {...props} />
}

export default BlockSwitcher
