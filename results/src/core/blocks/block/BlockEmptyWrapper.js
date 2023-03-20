import React from 'react'
import BlockSwitcher from 'core/blocks/block/BlockSwitcher'
import styled, { css } from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'

export const EmptyWrapper = ({ block, pageData, blockIndex }) => (
    <Wrapper className="empty-wrapper">
        {block.variants.map((block, variantIndex) => (
            <BlockSwitcher
                key={block.id}
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
            margin-bottom: ${spacing(3)};

            @media ${mq.large} {
                margin-bottom: ${spacing(6)};
            }
        `}
`

export default EmptyWrapper
