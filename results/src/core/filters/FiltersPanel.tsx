import React, { useState, Dispatch, SetStateAction, useEffect } from 'react'
import styled from 'styled-components'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import Button from 'core/components/Button'
import {
    CreateVariantType,
    CustomVariant,
    DeleteVariantType,
    UpdateVariantType,
    getFieldLabel,
    getFiltersQuery,
    getInitFilters,
    useCustomVariants
} from './helpers'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from '@devographics/react-i18n'
import isEmpty from 'lodash/isEmpty.js'
import {
    AutoSelectText,
    ExportButton,
    FiltersExport,
    GraphQLTrigger,
    JSONTrigger,
    Message_
} from 'core/blocks/block/BlockData'
import * as Tabs from '@radix-ui/react-tabs'
import {
    TabsList,
    TabsTrigger,
    getCustomTabId,
    getRegularTabId
} from 'core/blocks/block/BlockTabsWrapper'
import FacetSelection from './FacetSelection'
import FiltersSelection from './FiltersSelection'
import { MODE_DEFAULT, MODE_FACET, MODE_COMBINED, MODE_GRID } from './constants'
import cloneDeep from 'lodash/cloneDeep'
import { BlockVariantDefinition } from '../types/index'
import { useStickyState, getFiltersLink } from './helpers'
import { CheckIcon, DeleteIcon, EditIcon, TrashIcon } from 'core/icons'
import { CustomizationDefinition, SupportedMode } from './types'
import { useAllFilters } from 'core/charts/hooks'
import { useEntities } from 'core/helpers/entities'
import ModalTrigger from 'core/components/ModalTrigger'
import { copyTextToClipboard } from 'core/helpers/utils'

export type FiltersPanelPropsType = {
    block: BlockVariantDefinition
    variant?: CustomVariant
    createVariant: CreateVariantType
    updateVariant: UpdateVariantType
    deleteVariant: DeleteVariantType
    closeModal?: any
    setActiveTab: (value: string) => void
}

type TabConfigItem = {
    mode: SupportedMode
    component: React.FC
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
    const { getString } = useI18n()
    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const allFilters = useAllFilters()
    const entities = useEntities()

    const { id, name, chartFilters } = variant || {}
    const [variantName, setVariantName] = useState(name)

    const chartName = getBlockTitle({ block, pageContext, getString, entities })

    let initState = getInitFilters()
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
            if (filtersState?.facet) {
                const field = allFilters.find(q => q.id === filtersState?.facet?.id)
                if (field) {
                    const name = getFieldLabel({ getString, field, entities })
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

    const supportedModes = filtersState?.options?.supportedModes || [MODE_GRID, MODE_FACET]

    // if mode is set to "default" then open first supported filter tab
    const currentMode =
        filtersState.options.mode === MODE_DEFAULT ? supportedModes?.[0] : filtersState.options.mode

    // whenever this panel is loaded without a mode specified, set mode to currentMode
    useEffect(() => {
        if (filtersState.options.mode === MODE_DEFAULT) {
            setFiltersState((fState: CustomizationDefinition) => {
                const newState = cloneDeep(fState)
                newState.options.mode = currentMode
                return newState
            })
        }
    }, [])

    const tabConfig: TabConfigItem[] = [
        { mode: MODE_COMBINED, component: FiltersSelection },
        { mode: MODE_GRID, component: FiltersSelection },
        { mode: MODE_FACET, component: FacetSelection }
    ]
    const tabs = tabConfig.filter(tab => supportedModes?.includes(tab.mode))

    const filtersLink = getFiltersLink({ block, pageContext, filtersState })

    const handleTabChange = (tab: SupportedMode) => {
        setFiltersState((fState: CustomizationDefinition) => {
            const newState = cloneDeep(fState)
            newState.options.mode = tab
            return newState
        })
    }

    const query = getFiltersQuery({
        block,
        pageContext,
        chartFilters: filtersState,
        currentYear: currentEdition.year
    })?.query

    return (
        <Filters_>
            <FiltersTop_>
                <Heading_>
                    <span>{chartName}</span>
                    <span>–</span>
                    {id ? (
                        <>
                            <T k="filters.edit_variant_with_name" values={{ name: variantName }} />
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
                </Heading_>
                <a
                    href="https://github.com/Devographics/docs/blob/main/results/filters.md"
                    target="_blank"
                    rel="nofollow noreferrer"
                >
                    <T k="filters.docs" />
                </a>
            </FiltersTop_>
            <Tabs.Root
                defaultValue={currentMode}
                orientation="horizontal"
                onValueChange={handleTabChange}
            >
                <TabsList aria-label="tabs example">
                    {tabs.map(tab => (
                        <TabsTrigger_ key={tab.mode} value={tab.mode}>
                            <T k={`filters.${tab.mode}_mode`} />
                        </TabsTrigger_>
                    ))}
                </TabsList>
                {tabs.map(tab => {
                    const Component = tab.component
                    return (
                        <Tab_ key={tab.mode} value={tab.mode}>
                            <Component {...props} mode={tab.mode} />
                        </Tab_>
                    )
                })}
            </Tabs.Root>

            <FiltersBottom_>
                {/* <FooterLeft_>
                    <li>
                        <GraphQLTrigger
                            block={block}
                            query={query}
                            buttonProps={{ variant: 'link' }}
                        />
                    </li>
                    <li>
                        <JSONTrigger data={data} buttonProps={{ variant: 'link' }} />
                    </li>
                    <li>
                        <CopyLink link={filtersLink} />
                    </li>
                    <li>
                        <CopyFilters filtersState={filtersState} />
                    </li>
                </FooterLeft_> */}

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

const CopyFilters = ({ filtersState }: { filtersState: CustomizationDefinition }) => {
    return (
        <ModalTrigger
            trigger={
                <ExportButton className="ExportButton" size="small" variant="link">
                    <T k="filters.get_code" />
                    {/* <ExportIcon /> */}
                </ExportButton>
            }
        >
            <FiltersExport filtersState={filtersState} />
        </ModalTrigger>
    )
}

export const FiltersTop_ = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${spacing()};
`

export const Heading_ = styled.h3`
    margin: 0;
    display: flex;
    align-items: center;
    gap: 5px;
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
        background: ${props => props.theme.colors.backgroundBackground};
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
    display: flex;
    justify-content: flex-end;
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
