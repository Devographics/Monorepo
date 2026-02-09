import './FiltersPanel.scss'
import React, { useState } from 'react'
import styled from 'styled-components'
import T from 'core/i18n/T'
import { spacing, fontSize, mq } from 'core/theme'
import Button from 'core/components/Button'
import {
    CreateVariantType,
    CustomVariant,
    DeleteVariantType,
    UpdateVariantType,
    getFieldLabel,
    getInitFilters
} from './helpers'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from '@devographics/react-i18n'
import isEmpty from 'lodash/isEmpty.js'
import { AutoSelectText, ExportButton, GraphQLTrigger, TextArea } from 'core/blocks/block/BlockData'
import { getCustomTabId, getRegularTabId, TabsList } from 'core/blocks/block/BlockTabsWrapper'
import FacetSelection from './FacetSelection'
import FiltersSelection from './FiltersSelection'
import { BlockVariantDefinition } from '../types/index'
import { useStickyState, getFiltersLink } from './helpers'
import { CheckIcon, EditIcon } from '@devographics/icons'
import { CustomizationDefinition, PanelState, SupportedMode } from './types'
import { useAllFilters } from 'core/charts/hooks'
import { useEntities } from 'core/helpers/entities'
import ModalTrigger from 'core/components/ModalTrigger'
import { copyTextToClipboard } from 'core/helpers/utils'
import { Details } from 'core/components/Details'
import { AdvancedOptions } from './AdvancedOptions'
import { getBlockQuery } from 'core/queries/queries'
import * as Tabs from '@radix-ui/react-tabs'

export type FiltersPanelPropsType = {
    block: BlockVariantDefinition
    variant?: CustomVariant
    createVariant: CreateVariantType
    updateVariant: UpdateVariantType
    deleteVariant: DeleteVariantType
    closeModal?: any
    setActiveTab: (value: string) => void
}

const FiltersPanel = ({
    block,
    variant,
    createVariant,
    updateVariant,
    deleteVariant,
    closeModal,
    setActiveTab
}: FiltersPanelPropsType) => {
    const { getString, getFallbacks } = useI18n()
    const pageContext = usePageContext()
    const { currentEdition, currentSurvey, id: pageId } = pageContext
    const allFilters = useAllFilters()
    const entities = useEntities()

    const { id, name, chartFilters } = variant || {}
    const [variantName, setVariantName] = useState(name)

    const { tClean: chartName } = getBlockTitle({ block, pageContext, getFallbacks, entities })

    let initState = getInitFilters({ block })

    if (variant && !isEmpty(chartFilters)) {
        // if chart filters have been passed, use them to extend the default init filters
        initState = { ...initState, ...variant.chartFilters }
    }
    const [filtersState, setFiltersState] = useState(initState)

    const [customPresets, setCustomPresets] = useStickyState([], 'filters_panel_presets')

    const handleSubmit = () => {
        // in case filtersState has been inherited from filtersState defined at build time
        filtersState.options.preventQuery = false
        if (id) {
            updateVariant(id, { chartFilters: filtersState, name: variantName })
            setActiveTab(getCustomTabId(id))
            closeModal()
        } else {
            // nice-to-have: try to generate title when a facet is selected
            const defaultNameSegments = []
            if (filtersState?.axis2) {
                const field = allFilters.find(q => q.id === filtersState?.axis2?.id)
                if (field) {
                    const { label: name } = getFieldLabel({ getString, field, entities })
                    defaultNameSegments.push(getString('filters.vs_x', { values: { name } })?.t)
                }
            }
            const name = prompt(
                getString('charts.new_variant_name_prompt')?.t,
                defaultNameSegments.join(', ')
            )
            if (name) {
                const variant = createVariant({
                    blockId: block.id,
                    chartFilters: filtersState,
                    ...(name ? { name } : {})
                })
                setActiveTab(getCustomTabId(variant.id))
                closeModal()
            }
        }
    }

    const props = {
        chartName,
        block,
        allFilters,
        stateStuff: {
            filtersState,
            setFiltersState,
            customPresets,
            setCustomPresets
        }
    }

    const filtersLink = getFiltersLink({ block, pageContext, filtersState })

    const { query } = getBlockQuery({
        block,
        survey: currentSurvey,
        edition: currentEdition,
        section: { id: pageId },
        chartFilters: filtersState
    })

    const { customizationModes = [] } = block

    const hasFilters = filtersState.filters && filtersState.filters.length > 0
    return (
        <Filters_>
            <FiltersTop_>
                <Heading_>
                    <span className="filters-heading-title">{chartName}</span>
                    <span className="filters-heading-separator">–</span>
                    <span className="filters-heading-subtitle">
                        {id ? (
                            <>
                                <T
                                    k="filters.edit_variant_with_name"
                                    values={{ name: variantName }}
                                />
                                <EditIcon
                                    size="petite"
                                    labelId="filters.edit_name"
                                    onClick={() => {
                                        const newName = prompt(
                                            getString('filters.edit_name.description')?.t,
                                            name
                                        )
                                        if (newName) {
                                            setVariantName(newName)
                                        }
                                    }}
                                />
                            </>
                        ) : (
                            <T k="filters.create_variant" />
                        )}
                    </span>
                </Heading_>
                <a
                    href="https://github.com/Devographics/docs/blob/main/results/filters.md"
                    target="_blank"
                    rel="nofollow noreferrer"
                >
                    <T k="filters.docs" />
                </a>
            </FiltersTop_>
            <div className="filters-sections">
                {customizationModes.includes('facets') && (
                    <>
                        <Details labelId="filters.axis1" defaultOpen={true}>
                            <FacetSelection {...props} axisIndex={1} />
                        </Details>
                        <Details labelId="filters.axis2" isOptional={true} defaultOpen={true}>
                            <FacetSelection {...props} axisIndex={2} />
                        </Details>
                    </>
                )}
                {customizationModes.includes('filters') && (
                    <Details labelId="filters.grid_mode" isOptional={true} defaultOpen={hasFilters}>
                        <FiltersSelection {...props} />
                    </Details>
                )}
                <Details labelId="filters.advanced_options" isOptional={true} defaultOpen={false}>
                    <AdvancedOptions {...props} />
                </Details>
            </div>
            <FiltersBottom_>
                <FooterLeft_>
                    <li>
                        <GraphQLTrigger
                            block={block}
                            query={query}
                            buttonProps={{ variant: 'link' }}
                        />
                    </li>
                    {/* <li>
                        <CopyLink link={filtersLink} />
                    </li> */}
                    <li>
                        <FiltersModal
                            filtersState={filtersState}
                            setFiltersState={setFiltersState}
                        />
                    </li>
                </FooterLeft_>

                <FooterRight_>
                    {id && (
                        <Button
                            variant="link"
                            onClick={e => {
                                if (
                                    confirm(
                                        getString('filters.delete_variant_confirm', {
                                            values: { name: variantName }
                                        })?.t
                                    )
                                ) {
                                    setActiveTab(getRegularTabId(0))
                                    deleteVariant(id)
                                }
                            }}
                        >
                            <T k="filters.delete_variant" />
                            {/* <TrashIcon size="petite" labelId="filters.delete_variant" /> */}
                        </Button>
                    )}
                    <Button onClick={handleSubmit}>
                        <T k="filters.submit" />
                    </Button>
                </FooterRight_>
            </FiltersBottom_>
            {/* <pre>
                <code>{JSON.stringify(filtersState, null, 2)}</code>
            </pre> */}
        </Filters_>
    )
}

const CopyLink = ({ link }: { link: string }) => {
    const [isCopied, setIsCopied] = useState(false)

    // onClick handler function for the copy button
    const handleCopyClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        // Asynchronously call copyTextToClipboard
        await copyTextToClipboard(link)
        setIsCopied(true)
        setTimeout(() => {
            setIsCopied(false)
        }, 1500)
    }

    return (
        <CopyLink_ variant="link" href={link} onClick={handleCopyClick}>
            <T k="filters.copy_link" />
            {isCopied && <CheckIcon />}
        </CopyLink_>
    )
}

const FiltersModal = ({
    filtersState,
    setFiltersState
}: {
    filtersState: PanelState['filtersState']
    setFiltersState: PanelState['setFiltersState']
}) => {
    return (
        <ModalTrigger
            trigger={
                <ExportButton className="ExportButton" size="small" variant="link">
                    <T k="filters.code" />
                    {/* <ExportIcon /> */}
                </ExportButton>
            }
        >
            <FiltersExport filtersState={filtersState} setFiltersState={setFiltersState} />
        </ModalTrigger>
    )
}

export const FiltersExport = ({
    filtersState,
    setFiltersState,
    closeModal
}: {
    filtersState: CustomizationDefinition
    setFiltersState: PanelState['setFiltersState']
    closeModal: () => void
}) => {
    const { getString } = useI18n()
    const [importCode, setImportCode] = useState<string>('')
    const placeholder = getString('filters.paste_filters_code')?.t
    const handleSubmit = () => {
        const customizationDefinition = JSON.parse(importCode) as CustomizationDefinition
        setFiltersState(customizationDefinition)
        closeModal()
    }
    return (
        <div>
            <Tabs.Root defaultValue="tab-get-code" orientation="horizontal">
                <TabsList aria-label="tabs example">
                    <TabsTrigger_ value="tab-get-code">
                        <T k="filters.get_code" />
                    </TabsTrigger_>
                    <TabsTrigger_ value="tab-import-code">
                        <T k="filters.import_code" />
                    </TabsTrigger_>
                </TabsList>

                <Tab_ value="tab-get-code">
                    <div>
                        <AutoSelectText value={JSON.stringify(filtersState, null, 2)} />
                    </div>
                </Tab_>

                <Tab_ value="tab-import-code">
                    <div>
                        <TextArea
                            placeholder={placeholder}
                            value={importCode}
                            onChange={e => {
                                const value = e?.target?.value
                                setImportCode(value)
                            }}
                        />
                        <Button onClick={handleSubmit}>
                            <T k="filters.import_code" />
                        </Button>
                    </div>
                </Tab_>
            </Tabs.Root>
        </div>
    )
}

const Message_ = styled.div`
    margin-top: ${spacing(0.5)};
    font-size: ${fontSize('small')};
`

export const FiltersTop_ = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${spacing()};
    @media ${mq.smallMedium} {
        flex-direction: column;
        align-items: flex-start;
        gap: ${spacing(0.5)};
    }
`

export const Heading_ = styled.h3`
    margin: 0;
    display: flex;
    align-items: center;
    gap: 5px;

    @media ${mq.smallMedium} {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${spacing(0.5)};
    }
    .filters-heading-title {
    }
    .filters-heading-separator {
        @media ${mq.smallMedium} {
            display: none;
        }
    }
    .filters-heading-subtitle {
        display: flex;
        align-items: center;
        gap: ${spacing(0.5)};
    }
`

export const TabsTrigger_ = styled(Tabs.Trigger)`
    border: ${props => props.theme.border};
    background: ${props => props.theme.colors.backgroundAlt};
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
        background: var(--backgroundAlt3Color);
    }
`

export const Tab_ = styled(Tabs.Content)`
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding-top: ${spacing()};
`

const Filters_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

const FiltersBottom_ = styled.div`
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding-top: ${spacing()};
    display: flex;
    justify-content: space-between;
`

const FooterLeft_ = styled.ul`
    display: flex;
    gap: ${spacing()};
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
    li {
        text-align: center;
    }
`
const FooterRight_ = styled.div`
    display: flex;
    gap: ${spacing()};
    align-items: center;
`

const CopyLink_ = styled(Button)`
    display: flex;
    gap: ${spacing(0.25)};
    align-items: center;
`

export default FiltersPanel
