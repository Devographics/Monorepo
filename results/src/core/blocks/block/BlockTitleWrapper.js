import React from 'react'
import BlockSwitcher from 'core/blocks/block/BlockSwitcher'
import styled, { css } from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import BlockTitle from 'core/blocks/block/BlockTitle'

export const TitleWrapper = ({ block, pageData, blockIndex }) => (
    <BlockWrapper className="empty-wrapper">
        {block.variants.map((block, variantIndex) => (
            <TitleBlock
                key={block.id}
                block={block}
                pageData={pageData}
                blockIndex={blockIndex}
                variantIndex={variantIndex}
            />
        ))}
    </BlockWrapper>
)

const TitleBlock = ({ block, pageData, blockIndex, variantIndex }) => (
    <VariantWrapper id={block.id}>
        <BlockTitle block={block} />
        <BlockSwitcher
            key={block.id}
            block={block}
            pageData={pageData}
            blockIndex={blockIndex}
            variantIndex={variantIndex}
        />
    </VariantWrapper>
)

const BlockWrapper = styled.section`
`

const VariantWrapper = styled.div`
    padding: ${spacing()};
`

export default TitleWrapper
