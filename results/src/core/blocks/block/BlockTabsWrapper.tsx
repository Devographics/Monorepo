import React, { useEffect, useState } from 'react'
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
import { CustomVariant, useCustomVariants } from 'core/filters/helpers'
import T from 'core/i18n/T'
import { CustomVariantWrapper } from 'core/charts/common2'
import ModalTrigger from 'core/components/ModalTrigger'
import Button from 'core/components/Button'
import FiltersPanel from 'core/filters/FiltersPanel'
import { EditIcon } from 'core/icons'
import BlockQuestion from './BlockQuestion'
import { BlockDefinition } from 'core/types'
import { getAllQuestions } from 'core/helpers/options'

export const getRegularTabId = (index: number) => `tab-${index}`
export const getCustomTabId = (id: string) => `tabCustom-${id}`

export const TabsWrapper = ({
    block,
    pageData,
    blockIndex,
    withMargin = true
}: {
    block: BlockDefinition
    pageData: any
    blockIndex: number
    withMargin: boolean
}) => {
    const [customVariants, setCustomVariants] = useState<CustomVariant[]>([])
    const [activeTab, setActiveTab] = useState(getRegularTabId(0))
    const pageContext = usePageContext()
    const { getString } = useI18n()
    const entities = useEntities()
    let firstBlockVariant = block.variants[0]

    const blockEntity = entities.find(e => e.id === firstBlockVariant.id)
    if (blockEntity) {
        firstBlockVariant = {
            ...firstBlockVariant,
            entity: blockEntity
            // title: blockEntity?.nameClean || blockEntity?.name,
            // titleLink: blockEntity?.homepage?.url
        }
    }

    // this handles state for both compile-time (YAML) variants and
    // dynamic (query builder) variants and merges them all together
    const {
        customVariants: customVariants_,
        deleteVariant,
        createVariant,
        updateVariant
    } = useCustomVariants()

    // small hack to avoid SSR error or hydration mismatch;
    // this way customVariants is an empty array on both SSR and client first mount
    useEffect(() => {
        setCustomVariants(customVariants_)
    }, [customVariants_])

    const blockCustomVariants = customVariants.filter(v => v.blockId === block.id)

    const showTabs =
        [...block.variants, ...blockCustomVariants].length >= 2 ||
        firstBlockVariant.customizationModes

    const variantProps = {
        block: firstBlockVariant,
        createVariant,
        updateVariant,
        deleteVariant,
        setActiveTab
    }

    const regularVariants = block.variants

    const question = getAllQuestions(pageContext.currentEdition).find(
        q => q.id === (firstBlockVariant.fieldId ?? firstBlockVariant.id)
    )

    return (
        <Wrapper className={`tabs-wrapper tabs-wrapper-${block.id}`} withMargin={withMargin}>
            <BlockHeaderTop_ className="block-header-top">
                <BlockTitle block={firstBlockVariant} />
                {/* <BlockDescriptionContents block={firstBlockVariant} /> */}
                <BlockTakeaway block={firstBlockVariant} />
            </BlockHeaderTop_>
            <BlockQuestion block={firstBlockVariant} question={question} />

            {showTabs ? (
                <Tabs.Root
                    defaultValue="tab0"
                    orientation="horizontal"
                    value={activeTab}
                    activationMode="manual"
                    onValueChange={(value: string) => {
                        setActiveTab(value)
                    }}
                >
                    <BlockHeaderWrapper>
                        <BlockHeader className="block-header">
                            <BlockHeaderRight_>
                                <TabsList aria-label="tabs example">
                                    {block.variants.map((block, variantIndex) => {
                                        const { key, label } = getBlockTabTitle({
                                            block,
                                            pageContext,
                                            variantIndex,
                                            getString,
                                            entities
                                        })
                                        return (
                                            <Tab_ key={block.id}>
                                                <TabsTrigger value={getRegularTabId(variantIndex)}>
                                                    <span data-key={key}>{label}</span>
                                                </TabsTrigger>
                                            </Tab_>
                                        )
                                    })}
                                    {blockCustomVariants.map((variant, variantIndex) => (
                                        <Tab_ key={variant.name}>
                                            <TabsTrigger value={getCustomTabId(variant.id)}>
                                                {variant.name ? (
                                                    variant.name
                                                ) : (
                                                    <T
                                                        k="charts.custom_variant"
                                                        values={{ index: variantIndex + 1 }}
                                                    />
                                                )}
                                            </TabsTrigger>

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
                                        </Tab_>
                                    ))}
                                </TabsList>

                                {firstBlockVariant.customizationModes && (
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
                    </BlockHeaderWrapper>
                    {regularVariants.map((block, variantIndex) => (
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
                                    block={{
                                        ...firstBlockVariant,
                                        filtersState: variant.chartFilters
                                    }}
                                    isCustomVariant={true}
                                    pageData={pageData}
                                    blockIndex={blockIndex}
                                    variantIndex={variantIndex}
                                />
                            </CustomVariantWrapper>
                        </Tabs.Content>
                    ))}
                </Tabs.Root>
            ) : (
                <BlockSwitcher
                    block={{
                        ...firstBlockVariant,
                        filtersState: firstBlockVariant.filtersState
                    }}
                    pageData={pageData}
                    blockIndex={blockIndex}
                    variantIndex={0}
                />
            )}
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

const BlockHeaderWrapper = styled.div`
    overflow-x: scroll;
`
const BlockHeader = styled.div`
    /* display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: ${spacing(0.5)}; */
    min-width: 100%;
    width: max-content;
    border-bottom: ${props => props.theme.border};
`

const BlockHeaderRight_ = styled.div`
    display: flex;
    /* justify-content: flex-end; */
    align-items: center;
    gap: 10px;
    @media ${mq.large} {
        /* padding-right: 52px; */
    }
    overflow: auto;
    overflow-y: hidden;

    @media ${mq.large} {
        overflow: visible;
        width: max-content;
    }
`

export const TabsList = styled(Tabs.List)`
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
`

export const Tab_ = styled.div`
    border: ${props => props.theme.border};
    background: ${props => props.theme.colors.background};
    /* border: 1px solid ${props => props.theme.colors.border}; */
    border-radius: 3px 3px 0 0;
    cursor: pointer;
    margin-right: ${spacing(0.5)};
    margin-bottom: -1px;
    font-size: ${fontSize('smallish')};
    display: flex;
    align-items: center;
    /* gap: 5px; */
    &:has([data-state='active']) {
        border-bottom: 0;
    }
    &:has([data-state='inactive']) {
        opacity: 0.6;
        background: ${props => props.theme.colors.backgroundBackground};
    }
    .icon-wrapper {
        height: 24px;
        width: 24px;
        display: grid;
        place-items: center;
        margin-right: ${spacing(0.5)};
    }
`
export const TabsTrigger = styled(Tabs.Trigger)`
    padding: ${spacing(0.5)};
    border: 0;
    background: none;
`

const BlockHeaderTop_ = styled.div`
    margin-bottom: ${spacing()};
    display: flex;
    flex-direction: column;
    gap: ${spacing(0.5)};
`

const CustomizeButton_ = styled(Button)`
    min-height: 40px;
`
export default TabsWrapper
