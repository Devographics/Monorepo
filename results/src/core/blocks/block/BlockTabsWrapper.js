import React from 'react'
import BlockSwitcher from 'core/blocks/block/BlockSwitcher'
import * as Tabs from '@radix-ui/react-tabs'
import BlockTitle from 'core/blocks/block/BlockTitle'
import styled, { css } from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import { getBlockTabKey } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import get from 'lodash/get'

const BlockHeader = styled.div`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: ${spacing(0.5)};
    border-bottom: ${props => props.theme.border};
`

const TabsList = styled(Tabs.List)`
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    overflow: auto;
    overflow-y: hidden;

    @media ${mq.large} {
        overflow: visible;
        width: max-content;
        padding-right: 52px;
        overflow: visible;
    }
`

const TabsTrigger = styled(Tabs.Trigger)`
    border: ${props => props.theme.border};
    background: ${props => props.theme.colors.background};
    /* border: 1px solid ${props => props.theme.colors.border}; */
    border-radius: 3px 3px 0 0;
    padding: ${spacing(0.5)};
    cursor: pointer;
    margin-right: ${spacing(0.5)};
    margin-bottom: -1px;
    font-size: ${fontSize('smallish')};
    &[data-state='active'] {
        border-bottom: 0;
    }
    &[data-state='inactive'] {
        opacity: 0.6;
        background: ${props => props.theme.colors.backgroundBackground};
    }
`

export const TabsWrapper = ({ block, pageData, blockIndex, withMargin = true }) => {
    const context = usePageContext()

    let firstBlock = block.variants[0]
    if (firstBlock.entityPath) {
        const blockEntity = get(pageData, firstBlock.entityPath)
        firstBlock = {
            ...firstBlock,
            entity: blockEntity,
            title: blockEntity.name,
            titleLink: blockEntity?.homepage?.url
        }
    }

    return (
        <Wrapper className="tabs-wrapper" withMargin={withMargin}>
            <Tabs.Root defaultValue="tab0" orientation="horizontal">
                <BlockHeader>
                    <BlockTitle block={firstBlock} />
                    {block.variants.length > 1 && (
                        <TabsList aria-label="tabs example">
                            {block.variants.map((block, variantIndex) => (
                                <TabsTrigger key={block.id} value={`tab${variantIndex}`}>
                                    <T k={getBlockTabKey(block, context, variantIndex)} />
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    )}
                </BlockHeader>
                {block.variants.map((block, variantIndex) => (
                    <Tabs.Content key={block.id} value={`tab${variantIndex}`}>
                        <BlockSwitcher
                            block={block}
                            pageData={pageData}
                            blockIndex={blockIndex}
                            variantIndex={variantIndex}
                        />
                    </Tabs.Content>
                ))}
            </Tabs.Root>
        </Wrapper>
    )
}

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

export default TabsWrapper
