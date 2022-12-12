import React from 'react'
import BlockSwitcher from 'core/blocks/block/BlockSwitcher'
import styled, { css } from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import BlockTitle from 'core/blocks/block/BlockTitle'
import get from 'lodash/get'

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

const TitleBlock = ({ block, pageData, blockIndex, variantIndex }) => {

    if (block.entityPath) {
        const blockEntity = get(pageData, block.entityPath)
        block = {
            ...block,
            entity: blockEntity,
            title: blockEntity.nameClean || blockEntity.name,
            titleLink: blockEntity?.homepage?.url
        }
    }
    
    return (
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
)}

const BlockWrapper = styled.section`
`

const VariantWrapper = styled.div`
    padding: ${spacing()};
`

export default TitleWrapper
