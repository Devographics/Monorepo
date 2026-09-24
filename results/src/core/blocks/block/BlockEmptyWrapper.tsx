import React from 'react'
import BlockSwitcher from 'core/blocks/block/BlockSwitcher'
import styled, { css } from 'styled-components'
import { mq, spacing } from 'core/theme'
import { BlockVariantDefinition } from 'core/types'
import './Block.scss'

export const EmptyWrapper = ({
    block,
    pageData,
    blockIndex
}: {
    block: BlockVariantDefinition
    pageData?: any
    blockIndex?: number
}) => (
    <Wrapper data-blockId={block.id} className="block-wrapper empty-wrapper">
        {block.variants.map((block, variantIndex) => (
            <BlockSwitcher
                key={block.id + variantIndex}
                block={block}
                pageData={pageData}
                blockIndex={blockIndex}
                variantIndex={variantIndex}
            />
        ))}
    </Wrapper>
)

const Wrapper = styled.section`
    ${props =>
        props.withMargin &&
        css`
            margin-bottom: var(--tripleSpacing);

            @media ${mq.large} {
                margin-bottom: ${spacing(6)};
            }
        `}
`

export default EmptyWrapper
