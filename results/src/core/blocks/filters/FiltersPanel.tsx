import React, { useState, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import Button from 'core/components/Button'
import { getFiltersQuery, getInitFilters } from './helpers'
import { getBlockTitle } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from 'core/i18n/i18nContext'
import isEmpty from 'lodash/isEmpty.js'
import { GraphQLTrigger } from 'core/blocks/block/BlockData'
import * as Tabs from '@radix-ui/react-tabs'
import { TabsList, TabsTrigger } from 'core/blocks/block/BlockTabsWrapper'
import FacetSelection from './FacetSelection'
import FiltersSelection from './FiltersSelection'
import { MODE_DEFAULT, MODE_FACET, MODE_FILTERS } from './constants'
import cloneDeep from 'lodash/cloneDeep'
import { BlockDefinition } from 'core/types'

type FiltersPanelPropsType = {
    block: BlockDefinition
    chartFilters: any
    setChartFilters: Dispatch<SetStateAction<any>>
    closeModal: Function
}

const FiltersPanel = ({
    block,
    chartFilters,
    setChartFilters,
    closeModal
}: FiltersPanelPropsType) => {
    const { translate } = useI18n()
    const context = usePageContext()
    const { currentEdition } = context

    const chartName = getBlockTitle(block, context, translate)

    const initState = isEmpty(chartFilters) ? getInitFilters() : chartFilters
    const [filtersState, setFiltersState] = useState(initState)

    const handleSubmit = () => {
        setChartFilters(filtersState)
        closeModal()
    }

    const props = {
        chartName,
        block,
        stateStuff: {
            filtersState,
            setFiltersState
        }
    }

    // if mode is set to "default" then open Filters tab
    const defaultTab =
        filtersState.options.mode === MODE_DEFAULT ? MODE_FILTERS : filtersState.options.mode

    const { filters = [] } = block
    const tabConfig = {
        filters: { mode: MODE_FILTERS, component: FiltersSelection },
        facet: { mode: MODE_FACET, component: FacetSelection }
    }

    return (
        <Filters_>
            <Heading_>
                <T k="filters.compare_chart" values={{ chartName }} />
            </Heading_>
            <Tabs.Root defaultValue={defaultTab} orientation="horizontal">
                <TabsList aria-label="tabs example">
                    {filters.map(f => (
                        <TabsTrigger_ key={f} value={tabConfig[f].mode}>
                            <T k={`filters.${f}_mode`} />
                        </TabsTrigger_>
                    ))}
                </TabsList>
                {filters.map(f => {
                    const Component = tabConfig[f].component
                    return (
                        <Tab_ key={f} value={tabConfig[f].mode}>
                            <Component {...props} />
                        </Tab_>
                    )
                })}
            </Tabs.Root>

            <FiltersBottom_>
                <GraphQLTrigger
                    block={block}
                    query={getFiltersQuery({
                        block,
                        chartFilters: filtersState,
                        currentYear: currentEdition.year
                    })}
                    buttonProps={{ variant: 'link' }}
                />
                <Button onClick={handleSubmit}>
                    <T k="filters.submit" />
                </Button>
            </FiltersBottom_>
        </Filters_>
    )
}

export const Heading_ = styled.h3``

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

export default FiltersPanel
