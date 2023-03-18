import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HeatmapChart from 'core/charts/generic/HeatmapChart'
import { getTableData } from 'core/helpers/datatables'
import { FacetItem, BlockComponentProps } from 'core/types'
import { useLegends } from 'core/helpers/useBucketKeys'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { useTheme } from 'styled-components'
import TickItem from 'core/charts/generic/TickItem'
import { isPercentage } from 'core/helpers/units'
import round from 'lodash/round'
import sortBy from 'lodash/sortBy'
import sumBy from 'lodash/sumBy'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: FacetItem
}

const BracketMatchupsBlock = ({ block, data }: HorizontalBarBlockProps) => {
    const {
        id,
        mode = 'relative',
        defaultUnits = 'percentage',
        translateData = true,
        chartNamespace = block.blockNamespace,
        colorVariant
    } = block

    const theme = useTheme()

    const [units, setUnits] = useState(defaultUnits)

    const { completion, buckets } = data

    const { total } = completion

    const sortedBuckets = sortBy(buckets, b => sumBy(b.matchups, 'count')).reverse()
    const keys = sortedBuckets.map(b => b.id)
    const legends = useLegends(block, keys, 'bracket')

    const heatmapBuckets = sortedBuckets.map(bucket => {
        try {
            const { id, matchups } = bucket
            const heatmapBucket = { id }
            keys.forEach(k => {
                matchups.forEach(matchup => {
                    heatmapBucket[`${matchup.id}___count`] = matchup.count // not really used
                    heatmapBucket[`${matchup.id}___percentage`] = matchup.percentage // not really used
                    heatmapBucket[matchup.id] = matchup.percentage
                })
            })
            return heatmapBucket
        } catch (error) {
            console.log('// BracketMatchupsBlock data error')
            console.log(error)
            return {}
        }
    })

    return (
        <Block
            units={units}
            setUnits={setUnits}
            data={data}
            tables={[
                getTableData({
                    data: heatmapBuckets,
                    valueKeys: keys?.map(k => ({
                        id: `${k}___percentage`,
                        labelId: `options.${chartNamespace}.${k}`,
                        isPercentage: true
                    })),
                    translateData,
                    i18nNamespace: chartNamespace
                })
            ]}
            block={block}
        >
            <ChartContainer fit={false} height={600}>
                {/* <HeatmapChart
                    total={total}
                    buckets={heatmapBuckets}
                    data={heatmapBuckets}
                    bucketKeys={legends}
                    i18nNamespace={i18nNamespace}
                    // mode={mode}
                    // units={units}
                    // colorVariant={colorVariant}
                /> */}
                <ResponsiveHeatMap
                    data={heatmapBuckets}
                    nanColor={'rgba(255,255,255,0.1)'}
                    keys={keys}
                    colors={theme.colors.velocity}
                    labelTextColor={theme.colors.text}
                    theme={{
                        tooltip: {
                            container: {
                                color: 'rgb(39, 35, 37)'
                            }
                        }
                    }}
                    // colors="PRGn"
                    minValue={0}
                    maxValue={100}
                    margin={{ top: 130, right: 80, bottom: 60, left: 160 }}
                    label={(rowData, cellId) => {
                        return !rowData[cellId]
                            ? '-'
                            : isPercentage(units)
                            ? `${round(rowData[cellId], 1)}%`
                            : rowData[cellId]
                    }}
                    forceSquare={true}
                    axisTop={{
                        // orient: 'top',
                        // tickSize: 5,
                        // tickPadding: 5,
                        // tickRotation: -45,
                        // legend: '',
                        // legendOffset: 36,
                        renderTick: tick => (
                            <TickItem
                                tickRotation={-45}
                                i18nNamespace={chartNamespace}
                                shouldTranslate={translateData}
                                entity={buckets.find(b => b.id === tick.value)?.entity}
                                {...tick}
                            />
                        )
                    }}
                    // axisRight={null}
                    // axisBottom={null}
                    axisLeft={{
                        // orient: 'left',
                        // tickSize: 5,
                        // tickPadding: 5,
                        // tickRotation: 0,
                        // legend: '',
                        // legendPosition: 'middle',
                        // legendOffset: -40,
                        renderTick: tick => (
                            <TickItem
                                i18nNamespace={chartNamespace}
                                shouldTranslate={translateData}
                                entity={buckets.find(b => b.id === tick.value)?.entity}
                                {...tick}
                            />
                        )
                    }}
                    // cellOpacity={1}
                    // cellBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                    // labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
                    // defs={[
                    //     {
                    //         id: 'lines',
                    //         type: 'patternLines',
                    //         background: 'inherit',
                    //         color: 'rgba(0, 0, 0, 0.1)',
                    //         rotation: -45,
                    //         lineWidth: 4,
                    //         spacing: 7,
                    //     },
                    // ]}
                    // fill={[{ id: 'lines' }]}
                    // animate={true}
                    // motionConfig="wobbly"
                    // motionStiffness={80}
                    // motionDamping={9}
                    // hoverTarget="cell"
                    // cellHoverOthersOpacity={0.25}
                />
            </ChartContainer>
        </Block>
    )
}

BracketMatchupsBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        dataPath: PropTypes.string.isRequired,
        showDescription: PropTypes.bool,
        translateData: PropTypes.bool,
        mode: PropTypes.oneOf(['absolute', 'relative']),
        defaultUnits: PropTypes.oneOf(['percentageSurvey', 'percentageQuestion', 'count']),
        colorVariant: PropTypes.oneOf(['primary', 'secondary'])
    }).isRequired,
    data: PropTypes.shape({
        buckets: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired
            })
        ).isRequired
    }).isRequired
}

export default memo(BracketMatchupsBlock)
