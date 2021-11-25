// @ts-ignore
import React, { useMemo, useState } from 'react'
import { keyBy, sortBy } from 'lodash'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
// @ts-ignore
import Block from 'core/blocks/block/BlockVariant'
// @ts-ignore
import ChartContainer from 'core/charts/ChartContainer'
import { BlockContext } from 'core/blocks/types'
import { ToolsExperienceToolData, ToolsExperienceMarimekkoToolData } from './types'
import { ToolsExperienceMarimekkoChart, MARGIN, ROW_HEIGHT } from './ToolsExperienceMarimekkoChart'
import get from 'lodash/get'

/**
 * Convert raw API data to be compatible with nivo Marimekko chart.
 *
 * We also have to recompute the percentages as those returned by
 * the API are global, for this chart awareness is represented
 * using the thickness of the bars, so we want percentages relative
 * to awareness only.
 */
const useNormalizedData = (
    rawData: ToolsExperienceToolData[]
): ToolsExperienceMarimekkoToolData[] =>
    useMemo(() => {
        let data: ToolsExperienceMarimekkoToolData[] = rawData.map((tool) => {
            const keyedBuckets = keyBy(get(tool, 'experience.year.facets.0.buckets'), 'id')

            const total = get(tool, 'experience.year.completion.total')
            const aware = total - keyedBuckets.never_heard.count

            return {
                id: tool.id,
                tool: { ...tool.entity, id: tool.id },
                awareness: aware,
                would_not_use: (keyedBuckets.would_not_use.count / aware) * 100 * -1,
                not_interested: (keyedBuckets.not_interested.count / aware) * 100 * -1,
                interested: (keyedBuckets.interested.count / aware) * 100,
                would_use: (keyedBuckets.would_use.count / aware) * 100,
            }
        })

        // tools with the most positive experience come first,
        // interested users and users willing to use it again
        data = sortBy(data, (datum) => datum.interested + datum.would_use)
        data.reverse()

        return data
    }, [rawData])

interface ToolsExperienceMarimekkoBlockProps {
    index: number
    block: BlockContext<
        'toolsExperienceMarimekkoTemplate',
        'ToolsExperienceMarimekkoBlock',
        { toolIds: string },
        any
    >
    data: ToolsExperienceToolData[]
    triggerId: string | null
}

export const ToolsExperienceMarimekkoBlock = ({
    block,
    data,
    triggerId = null,
}: ToolsExperienceMarimekkoBlockProps) => {
    const normalizedData = useNormalizedData(data)

    // make the height relative to the number of tools
    // in order to try to get consistent sizes across
    // the different sections, otherwise sections with
    // fewer tools would appear to have a better awareness
    // than those with more.
    const height = MARGIN.top + ROW_HEIGHT * data.length + MARGIN.bottom

    const controlledCurrent = triggerId

    
    const { translate } = useI18n()

    const headings = [{id: 'label', label: translate('tools.technology')}];
    data[0].experience.year.facets[0].buckets.forEach((bucket) => {
      headings.push({id: bucket.id, label: translate(`options.tools.${bucket.id}.short`)});
    })
    
    const getRows = (data) => {
      const rows = [];
      data.forEach((row) => {
        const newRow = [{id: 'label', label: row.entity.name}];
        row.experience.year.facets[0].buckets.forEach((bucket) => {
          newRow.push({
            id: bucket.id,
            label: `${bucket.percentage}% (${bucket.count})`,
          })
        })
        rows.push(newRow);
      });
      return rows;
    }

    const tables = [{
      headings: headings,
      rows: getRows(data),
    }];

    return (
        <Block
            block={{
                ...block,
                showLegend: false,
            }}
            data={data}
            
            
            tables={tables}
        >
            <ChartContainer fit height={height}>
                <ToolsExperienceMarimekkoChart data={normalizedData} current={controlledCurrent} />
            </ChartContainer>
        </Block>
    )
}
