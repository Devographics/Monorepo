import React from 'react'
import { EmptyWrapper, TabsWrapper } from 'core/blocks/block/BlockTabs'
import { ErrorBoundary } from 'core/blocks/block/BlockError'

const BlockWrapper = (props) => {
    const { block, pageData, index: blockIndex } = props
    const wrapBlock = block.wrapBlock ?? block?.variants[0]?.wrapBlock ?? true
    const WrapperComponent = wrapBlock ? TabsWrapper : EmptyWrapper
    const isHidden = block.variants.every((v) => v.hidden)
    return isHidden ? null : (
        <WrapperComponent block={block} pageData={pageData} blockIndex={blockIndex} />
    )
}

const BlockWrapperWithBoundary = (props) => (
    <ErrorBoundary {...props}>
        <BlockWrapper {...props} />
    </ErrorBoundary>
)

export default BlockWrapperWithBoundary
