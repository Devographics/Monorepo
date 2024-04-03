import Button from 'core/components/Button'
import './ChartFooter.scss'
import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import { FiltersExport, GraphQLExport, JSONExport } from 'core/blocks/block/BlockData'
import { CommonProps } from './types'
import { getFiltersQuery } from 'core/filters/helpers'
import { getBlockQuery } from 'core/helpers/queries'
import { CustomizationDefinition } from 'core/filters/types'
import { TabsList } from 'core/blocks/block/BlockTabsWrapper'
import { Tab_, TabsTrigger_ } from 'core/filters/FiltersPanel'
import * as Tabs from '@radix-ui/react-tabs'
import T from 'core/i18n/T'

const getQuery = ({
    block,
    pageContext,
    chartFilters
}: { chartFilters?: CustomizationDefinition } & Pick<CommonProps, 'block' | 'pageContext'>) => {
    if (chartFilters) {
        return getFiltersQuery({
            block,
            pageContext,
            chartFilters,
            currentYear: 2024
        })?.query
    } else {
        return getBlockQuery({ block, pageContext })
    }
}

export const ChartData = ({ block, pageContext, series, variant }: CommonProps) => {
    const chartFilters = variant?.chartFilters || block.filtersState
    const query = getQuery({ block, pageContext, chartFilters })
    return (
        <ModalTrigger
            trigger={
                <Button variant="link" className="chart-data">
                    Export Data…
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
                </Tabs.Root>
            </div>
        </ModalTrigger>
    )
}

export default ChartData
