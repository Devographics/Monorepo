import React, { useState } from 'react'
import { useTheme } from 'styled-components'
import Block from 'core/blocks/block/BlockVariant'
import compact from 'lodash/compact'
import round from 'lodash/round'
import get from 'lodash/get'
import { keys } from 'core/bucket_keys'
import ToolsScatterplotChart from 'core/charts/tools/ToolsScatterplotChart'
import { useI18n } from 'core/i18n/i18nContext'
import ChartContainer from 'core/charts/ChartContainer'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import variables from 'Config/variables.yml'
import T from 'core/i18n/T'

const { toolsCategories } = variables

/*

Parse data and convert it into a format compatible with the Scatterplot chart

*/
const useChartData = (data, translate, metric = 'satisfaction') => {
    const theme = useTheme()

    const allTools = Object.keys(toolsCategories)
        .filter((c) => !c.includes('abridged'))
        .map((categoryId) => {
            const toolsIds = toolsCategories[categoryId]

            const categoryTools = data.filter((tool) => toolsIds.includes(tool.id))
            const categoryData =
                categoryTools &&
                categoryTools.map((tool) => {
                    const { id, entity, experience } = tool
                    const name = entity.name
                    const buckets = get(experience, 'year.buckets')
                    const total = get(experience, 'year.total')

                    // if tool doesn't have experience data, abort
                    if (!buckets) {
                        return null
                    }

                    // get count for a given bucket
                    const getCount = (id) => {
                        return buckets && buckets.find((b) => b.id === id).count
                    }

                    const totals = {
                        satisfaction: getCount('would_use') + getCount('would_not_use'),
                        interest: getCount('interested') + getCount('not_interested'),
                        awareness: total,
                    }

                    const getPercentage = (id) => {
                        return round((getCount(id) / totals[metric]) * 100, 2)
                    }

                    const percentages = {
                        satisfaction: getPercentage('would_use'),
                        interest: getPercentage('interested'),
                        awareness: 100 - getPercentage('never_heard'),
                    }

                    // note: we use the same x for all metrics to stay consistent
                    const node = {
                        id,
                        originalId: id,
                        x: totals['satisfaction'],
                        y: percentages[metric],
                        name,
                    }

                    return node
                })

            const color = theme.colors.ranges.toolSections[categoryId]

            return categoryData.length > 0
                ? {
                      id: categoryId,
                      name: translate(`page.${categoryId}`),
                      color,
                      data: compact(categoryData),
                  }
                : null
        })
    return compact(allTools)
}

const Switcher = ({ setMetric, metric }) => {
    return (
        <ButtonGroup>
            {['satisfaction', 'interest'].map((key) => (
                <Button
                    key={key}
                    size="small"
                    className={`Button--${metric === key ? 'selected' : 'unselected'}`}
                    onClick={() => setMetric(key)}
                >
                    <T k={`options.experience_ranking.${key}`} />
                </Button>
            ))}
        </ButtonGroup>
    )
}

const ToolsScatterplotBlock = ({ block, data, triggerId, titleProps }) => {
    const { translate } = useI18n()
    const theme = useTheme()

    const [metric, setMetric] = useState('satisfaction')
    const chartData = useChartData(data, translate, metric)
    const [current, setCurrent] = useState(null)

    const legends = keys.toolSections.keys.map(({ id: keyId, color }) => ({
        id: `toolCategories.${keyId}`,
        label: translate(`page.${keyId}.short`),
        keyLabel: `${translate(`page.${keyId}.short`)}:`,
        color: theme.colors.ranges.toolSections[keyId],
    }))

    const controlledCurrent = triggerId || current

    const chartClassName = controlledCurrent ? `ToolsScatterplotChart--${controlledCurrent}` : ''

    return (
        <Block
            className="ToolsScatterplotBlock"
            data={chartData}
            block={{ ...block, blockName: 'tools_quadrant', showLegend: false, legends }}
            titleProps={{
                switcher: <Switcher setMetric={setMetric} metric={metric} />,
                ...titleProps,
            }}
            legendProps={{
                legends,
                onMouseEnter: ({ id }) => {
                    setCurrent(id.replace('toolCategories.', ''))
                },
                onMouseLeave: () => {
                    setCurrent(null)
                },
            }}
        >
            <ChartContainer vscroll={false}>
                <ToolsScatterplotChart
                    className={`ToolsScatterplotChart ${chartClassName}`}
                    data={chartData}
                    metric={metric}
                    showQuadrants={metric === 'satisfaction'}
                    current={controlledCurrent}
                    setCurrent={setCurrent}
                />
            </ChartContainer>
        </Block>
    )
}

export default ToolsScatterplotBlock
