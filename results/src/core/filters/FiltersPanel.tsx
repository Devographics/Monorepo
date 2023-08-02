import React, { useState, Dispatch, SetStateAction, useEffect } from 'react'
import styled from 'styled-components'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import Button from 'core/components/Button'
import { getFiltersQuery, getInitFilters } from './helpers'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from 'core/i18n/i18nContext'
import isEmpty from 'lodash/isEmpty.js'
import { GraphQLTrigger, JSONTrigger } from 'core/blocks/block/BlockData'
import * as Tabs from '@radix-ui/react-tabs'
import { TabsList, TabsTrigger } from 'core/blocks/block/BlockTabsWrapper'
import FacetSelection from './FacetSelection'
import FiltersSelection from './FiltersSelection'
import { MODE_DEFAULT, MODE_FACET, MODE_COMBINED, MODE_GRID } from './constants'
import cloneDeep from 'lodash/cloneDeep'
import { BlockDefinition } from '../types/index'
import { useStickyState, getFiltersLink } from './helpers'
import { CheckIcon } from 'core/icons'
import { CustomizationDefinition, SupportedMode } from './types'
import { useAllFilters } from 'core/charts/hooks'
import { useEntities } from 'core/helpers/entities'

type FiltersPanelPropsType = {
    block: BlockDefinition
    chartFilters: CustomizationDefinition
    setChartFilters: Dispatch<SetStateAction<CustomizationDefinition>>
    closeModal: any
    data: any
}

type TabConfigItem = {
    mode: SupportedMode
    component: React.FC
}

const FiltersPanel = ({
    block,
    chartFilters,
    setChartFilters,
    closeModal,
    data
}: FiltersPanelPropsType) => {
    const { getString } = useI18n()
    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const allFilters = useAllFilters()
    const entities = useEntities()

    const chartName = getBlockTitle({ block, pageContext, getString, entities })

    const initState = isEmpty(chartFilters) ? getInitFilters() : chartFilters
    const [filtersState, setFiltersState] = useState(initState)

    const [customPresets, setCustomPresets] = useStickyState([], 'filters_panel_presets')

    const handleSubmit = () => {
        setChartFilters(filtersState)
        closeModal()
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

    const supportedModes = filtersState.options.supportedModes

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

    return (
        <Filters_>
            <FiltersTop_>
                <Heading_>
                    <T k="filters.compare_chart" values={{ chartName }} />
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
                <FooterLeft_>
                    <GraphQLTrigger
                        block={block}
                        query={
                            getFiltersQuery({
                                block,
                                pageContext,
                                chartFilters: filtersState,
                                currentYear: currentEdition.year
                            })?.query
                        }
                        buttonProps={{ variant: 'link' }}
                    />
                    <CopyLink link={filtersLink} />
                </FooterLeft_>
                <Button onClick={handleSubmit}>
                    <T k="filters.submit" />
                </Button>
            </FiltersBottom_>
            {/* <pre>
                <code>{JSON.stringify(filtersState, null, 2)}</code>
            </pre> */}
        </Filters_>
    )
}

const CopyLink = ({ link }: { link: string }) => {
    const [isCopied, setIsCopied] = useState(false)

    async function copyTextToClipboard(text: string) {
        if ('clipboard' in navigator) {
            return await navigator.clipboard.writeText(text)
        } else {
            return document.execCommand('copy', true, text)
        }
    }

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
        <CopyLink_ href={link} onClick={handleCopyClick}>
            <T k="filters.copy_link" />
            {isCopied && <CheckIcon />}
        </CopyLink_>
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

const Tab_ = styled(Tabs.Content)`
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
    justify-content: space-between;
`

const FooterLeft_ = styled.div`
    display: flex;
    gap: ${spacing()};
    align-items: center;
`

const CopyLink_ = styled.a`
    display: flex;
    gap: ${spacing(0.25)};
    align-items: center;
`

export default FiltersPanel
