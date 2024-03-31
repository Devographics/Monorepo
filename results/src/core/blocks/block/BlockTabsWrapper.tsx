import React, { useState } from 'react'
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
import { CustomVariantWrapper } from 'core/charts/common2'
import ModalTrigger from 'core/components/ModalTrigger'
import Button from 'core/components/Button'
import FiltersPanel from 'core/filters/FiltersPanel'
import { EditIcon } from 'core/icons'
import BlockQuestion from './BlockQuestion'

export const getRegularTabId = (index: number) => `tab-${index}`
export const getCustomTabId = (id: string) => `tabCustom-${id}`

export const TabsWrapper = ({ block, pageData, blockIndex, withMargin = true }) => {
    const [activeTab, setActiveTab] = useState(getRegularTabId(0))
    const pageContext = usePageContext()
    const { getString } = useI18n()
    const entities = useEntities()
    let firstBlockVariant = block.variants[0]
    const blockEntity = entities.find(e => e.id === firstBlockVariant.id)
    firstBlockVariant = {
        ...firstBlockVariant,
        entity: blockEntity,
        title: blockEntity?.nameClean || blockEntity?.name,
        titleLink: blockEntity?.homepage?.url
    }

    const { customVariants, deleteVariant, createVariant, updateVariant } = useCustomVariants()

    const blockCustomVariants = customVariants.filter(v => v.blockId === block.id)

    const showTabs =
        [...block.variants, ...blockCustomVariants].length >= 2 || firstBlockVariant.canCustomize

    const variantProps = {
        block: firstBlockVariant,
        createVariant,
        updateVariant,
        deleteVariant,
        setActiveTab
    }

    return (
        <Wrapper className="tabs-wrapper" withMargin={withMargin}>
            <Tabs.Root
                defaultValue="tab0"
                orientation="horizontal"
                value={activeTab}
                onValueChange={(value: string) => {
                    setActiveTab(value)
                }}
            >
                <BlockHeader className="block-header">
                    <BlockHeaderTop_>
                        <BlockTitle block={firstBlockVariant} />
                        <BlockQuestion block={firstBlockVariant} />
                        <BlockTakeaway block={firstBlockVariant} />
                    </BlockHeaderTop_>
                    <BlockHeaderRight_>
                        {showTabs && (
                            <TabsList aria-label="tabs example">
                                {block.variants.map((block, variantIndex) => (
                                    <TabsTrigger
                                        key={block.id}
                                        value={getRegularTabId(variantIndex)}
                                    >
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
                                    <TabsTrigger
                                        key={variant.name}
                                        value={getCustomTabId(variant.id)}
                                    >
                                        {variant.name ? (
                                            variant.name
                                        ) : (
                                            <T
                                                k="charts.custom_variant"
                                                values={{ index: variantIndex + 1 }}
                                            />
                                        )}
                                        <ModalTrigger
                                            trigger={
                                                <EditIcon
                                                    size="petite"
                                                    labelId="filters.edit_variant"
                                                />
                                            }
                                        >
                                            <FiltersPanel {...variantProps} variant={variant} />
                                        </ModalTrigger>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        )}

                        {firstBlockVariant.canCustomize && (
                            <ModalTrigger
                                trigger={
                                    <CustomizeButton_ variant="link">
                                        <T k="filters.customize_chart" />
                                    </CustomizeButton_>
                                }
                            >
                                <FiltersPanel {...variantProps} />
                            </ModalTrigger>
                        )}
                    </BlockHeaderRight_>
                </BlockHeader>
                {block.variants.map((block, variantIndex) => (
                    <Tabs.Content key={block.id} value={getRegularTabId(variantIndex)}>
                        <BlockSwitcher
                            block={block}
                            pageData={pageData}
                            blockIndex={blockIndex}
                            variantIndex={variantIndex}
                        />
                    </Tabs.Content>
                ))}
                {blockCustomVariants.map((variant, variantIndex) => (
                    <Tabs.Content key={variant.name} value={getCustomTabId(variant.id)}>
                        <CustomVariantWrapper variant={variant} {...variantProps}>
                            <BlockSwitcher
                                block={firstBlockVariant}
                                pageData={pageData}
                                blockIndex={blockIndex}
                                variantIndex={variantIndex}
                                blockComponentProps={{ variant, updateVariant, deleteVariant }}
                            />
                        </CustomVariantWrapper>
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

const BlockHeader = styled.div`
    /* display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: ${spacing(0.5)}; */
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
    display: flex;
    align-items: center;
    gap: 5px;
    &[data-state='active'] {
        border-bottom: 0;
    }
    &[data-state='inactive'] {
        opacity: 0.6;
        background: ${props => props.theme.colors.backgroundBackground};
    }
`

const BlockHeaderTop_ = styled.div`
    margin-bottom: ${spacing()};
`

const BlockHeaderRight_ = styled.div`
    display: flex;
    /* justify-content: flex-end; */
    align-items: center;
    gap: 10px;
    @media ${mq.large} {
        /* padding-right: 52px; */
    }
`

const CustomizeButton_ = styled(Button)`
    min-height: 40px;
`
export default TabsWrapper
