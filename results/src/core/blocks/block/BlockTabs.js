import React from 'react'
import BlockSwitcher from 'core/blocks/block/BlockSwitcher'
import * as Tabs from '@radix-ui/react-tabs'
import BlockTitle from 'core/blocks/block/BlockTitle'
import styled from 'styled-components'
import { spacing, fontSize } from 'core/theme'

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
    margin-bottom: ${spacing(6)};
`

const BlockHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: ${(props) => props.theme.border};
`

const TabsList = styled(Tabs.List)`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 52px;
`

const TabsTrigger = styled(Tabs.Trigger)`
    border: ${(props) => props.theme.border};
    background: ${(props) => props.theme.colors.background};
    /* border: 1px solid ${(props) => props.theme.colors.border}; */
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
      background: ${(props) => props.theme.colors.backgroundBackground};

    }
`

export const TabsWrapper = ({ block, pageData, blockIndex }) => (
    <Wrapper className="tabs-wrapper">
        <Tabs.Root defaultValue="tab0" orientation="horizontal">
            <BlockHeader>
                <BlockTitle block={block.variants[0]} {...block.variants[0].titleProps} />
                {block.variants.length > 1 && (
                    <TabsList aria-label="tabs example">
                        {block.variants.map((block, variantIndex) => (
                            <TabsTrigger key={block.id} value={`tab${variantIndex}`}>
                                {block.id}
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

export default TabsWrapper
