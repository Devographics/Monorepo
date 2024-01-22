import React from 'react'
import TabsWrapper from 'core/blocks/block/BlockTabsWrapper'
import EmptyWrapper from 'core/blocks/block/BlockEmptyWrapper'
import TitleWrapper from 'core/blocks/block/BlockTitleWrapper'
import { ErrorBoundary } from 'core/blocks/block/BlockError'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockDefinition } from 'core/types'

const BlockWrapper = ({
    block,
    index: blockIndex,
    withMargin
}: {
    block: BlockDefinition
    index?: any
    withMargin?: boolean
}) => {
    const context = usePageContext()
    const { pageData, isCapturing } = context
    const wrapBlock = block.wrapBlock ?? block.variants?.[0]?.wrapBlock ?? true
    const WrapperComponent = wrapBlock ? (isCapturing ? TitleWrapper : TabsWrapper) : EmptyWrapper
    const isHidden = block.variants?.every(v => v.hidden) && !isCapturing
    return isHidden ? null : (
        <WrapperComponent
            block={block}
            pageData={pageData}
            blockIndex={blockIndex}
            withMargin={withMargin}
        />
    )
}

const BlockWrapperWithBoundary = (props: any) => (
    <ErrorBoundary {...props}>
        <BlockWrapper {...props} />
    </ErrorBoundary>
)

export default BlockWrapperWithBoundary
