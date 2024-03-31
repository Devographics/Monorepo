import React from 'react'
import BlockSwitcher from 'core/blocks/block/BlockSwitcher'
import * as Tabs from '@radix-ui/react-tabs'
import BlockTitle from 'core/blocks/block/BlockTitle'
import styled, { css } from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import { getBlockTabTitle } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { useEntities } from 'core/helpers/entities'
import BlockTakeaway from './BlockTakeaway'
import { useI18n } from '@devographics/react-i18n'
import { BlockDefinition } from 'core/types'
import { useCustomVariants, useStickyState } from 'core/filters/helpers'
import FiltersTrigger from 'core/filters/FiltersTrigger'
import T from 'core/i18n/T'

const BlockHeader = styled.div`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: ${spacing(0.5)};
    border-bottom: ${props => props.theme.border};
`

export const TabsList = styled(Tabs.List)`
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

export const TabsTrigger = styled(Tabs.Trigger)`
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
    const pageContext = usePageContext()
    const { getString } = useI18n()
    const entities = useEntities()
    let firstBlock = block.variants[0]
    const blockEntity = entities.find(e => e.id === firstBlock.id)
    firstBlock = {
        ...firstBlock,
        entity: blockEntity,
        title: blockEntity?.nameClean || blockEntity?.name,
        titleLink: blockEntity?.homepage?.url
    }

    const { customVariants, getVariant, deleteVariant, addVariant, updateVariant } =
        useCustomVariants()

    const blockCustomVariants = customVariants.filter(v => v.blockId === block.id)

    return (
        <Wrapper className="tabs-wrapper" withMargin={withMargin}>
            <Tabs.Root defaultValue="tab0" orientation="horizontal">
                <BlockHeader className="block-header">
                    <BlockTitle block={firstBlock} />
                    <BlockTakeaway block={firstBlock} />
                    {block.variants.length > 1 && (
                        <TabsList aria-label="tabs example">
                            {block.variants.map((block, variantIndex) => (
                                <TabsTrigger key={block.id} value={`tab${variantIndex}`}>
                                    {getBlockTabTitle({
                                        block,
                                        pageContext,
                                        variantIndex,
                                        getString,
                                        entities
                                    })}
                                </TabsTrigger>
                            ))}
                            {blockCustomVariants.map((variant, variantIndex) => (
                                <TabsTrigger key={variant.name} value={`tabCustom-${variantIndex}`}>
                                    {variant.name ? (
                                        variant.name
                                    ) : (
                                        <T
                                            k="charts.custom_variant"
                                            values={{ index: variantIndex + 1 }}
                                        />
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    )}
                    <FiltersTrigger
                        block={block}
                        addVariant={addVariant}
                        updateVariant={updateVariant}
                    />
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
                {blockCustomVariants.map((variant, variantIndex) => (
                    <Tabs.Content key={variant.name} value={`tabCustom-${variantIndex}`}>
                        custom variant {variant.name}
                        <BlockSwitcher
                            block={block.variants[0]}
                            pageData={pageData}
                            blockIndex={blockIndex}
                            variantIndex={variantIndex}
                            blockComponentProps={{ variant, updateVariant, deleteVariant }}
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
                margin-bottom: ${spacing(4)};
            }
        `}
`

export default TabsWrapper
