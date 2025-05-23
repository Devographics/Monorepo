import Button from 'core/components/Button'
import './ChartFooter.scss'
import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import { FiltersExport, GraphQLExport, JSONExport, DebugExport } from 'core/blocks/block/BlockData'
import { CommonProps } from './types'
import { getBlockQuery } from 'core/queries'
import { TabsList } from 'core/blocks/block/BlockTabsWrapper'
import { Tab_, TabsTrigger_ } from 'core/filters/FiltersPanel'
import * as Tabs from '@radix-ui/react-tabs'
import T from 'core/i18n/T'

export const ChartData = <ChartStateType,>({
    block,
    chartState,
    pageContext,
    series,
    variant
}: CommonProps<ChartStateType>) => {
    const chartFilters = variant?.chartFilters || block.filtersState
    const { currentSurvey, currentEdition, id: pageId } = pageContext

    const { query } = getBlockQuery({
        block,
        chartFilters,
        survey: currentSurvey,
        edition: currentEdition,
        section: { id: pageId }
    })
    return (
        <ModalTrigger
            trigger={
                <Button variant="link" className="chart-data">
                    <T k="charts.export" />
                </Button>
            }
        >
            <div className="chart-data-modal">
                <Tabs.Root defaultValue="tab-data" orientation="horizontal">
                    <TabsList aria-label="tabs example">
                        <TabsTrigger_ value="tab-data">
                            <T k="export.export_json" />
                        </TabsTrigger_>
                        <TabsTrigger_ value="tab-query">
                            <T k="export.export_graphql" />
                        </TabsTrigger_>
                        {chartFilters && (
                            <TabsTrigger_ value="tab-filters">
                                <T k="export.export_filters" />
                            </TabsTrigger_>
                        )}
                        <TabsTrigger_ value="tab-debug">
                            <T k="export.debug" />
                        </TabsTrigger_>
                    </TabsList>

                    <Tab_ value="tab-data">
                        <JSONExport data={series} />
                    </Tab_>

                    <Tab_ value="tab-query">
                        <GraphQLExport query={query} />
                    </Tab_>
                    {chartFilters && (
                        <Tab_ value="tab-filters">
                            <FiltersExport filtersState={chartFilters} />
                        </Tab_>
                    )}
                    <Tab_ value="tab-debug">
                        <DebugExport chartState={chartState} />
                    </Tab_>
                </Tabs.Root>
            </div>
        </ModalTrigger>
    )
}

export default ChartData
