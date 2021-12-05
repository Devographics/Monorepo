import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { BracketFacetItem, BlockComponentProps, BlockDefinition } from 'core/types'
import sortBy from 'lodash/sortBy'
import { useLegends } from 'core/helpers/useBucketKeys'
import { useTheme } from 'styled-components'
import { useTheme as useNivoTheme } from '@nivo/core'
import { useI18n } from 'core/i18n/i18nContext'
import { useEntities } from 'core/entities/entitiesContext'
import { isPercentage } from 'core/helpers/units'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: BracketFacetItem
}

export interface HorizontalBarChartBucketItem {
    id: string | number
    color?: string
}

const getChartData = ({ data, keys }: { data: BracketFacetItem; keys?: string[] }) => {
    const theme = useTheme()
    try {
        return sortBy(data.buckets, b => b.combined.count).map(bucket => {
            const bucketByRound: HorizontalBarChartBucketItem = { id: bucket.id }
            keys?.forEach(r => {
                bucketByRound[`${r}___count`] = bucket[r]['count']
                bucketByRound[`${r}___percentage`] = bucket[r]['percentage']
                bucketByRound.color = theme.colors.ranges.bracket[r]
            })
            return bucketByRound
        })
    } catch (error) {
        console.log('// Bracket wins getChartData error')
        console.log(error)
        return []
    }
}

const BracketWinsBlock = ({ block, data, keys }: HorizontalBarBlockProps) => {
    const {
        id,
        mode = 'relative',
        defaultUnits = 'count',
        translateData = true,
        i18nNamespace = block.id,
        colorVariant
    } = block

    const theme = useTheme()

    const rounds = keys

    // const [units, setUnits] = useState(defaultUnits)
    const units = defaultUnits

    const { completion } = data

    const { total } = completion

    const legends = keys && useLegends(block, keys, 'bracket')

    const buckets = getChartData({ data, keys })

    return (
        <Block
            units={units}
            // setUnits={setUnits}
            data={data}
            tables={[
                getTableData({
                    data: [...buckets].reverse(),
                    valueKeys: keys?.map(k => ({
                        id: `${k}___count`,
                        labelId: `options.bracket.${k}`
                    })),
                    translateData,
                    i18nNamespace
                })
            ]}
            legends={legends}
            block={block}
        >
            <ChartContainer fit={true}>
                <HorizontalBarChart
                    size="l"
                    total={total}
                    buckets={buckets}
                    i18nNamespace={i18nNamespace}
                    translateData={translateData}
                    mode={mode}
                    units={units}
                    colorVariant={colorVariant}
                    chartProps={{
                        keys: rounds.map(r => `${r}___${units}`),
                        indexBy: 'id',
                        maxValue: data.completion.count * 2,
                        // colorBy: 'color',
                        colors: rounds.map(r => theme.colors.ranges.bracket[r]),
                        tooltip: barProps => (
                            <BarTooltip
                                units={units}
                                i18nNamespace={i18nNamespace}
                                shouldTranslate={translateData}
                                {...barProps}
                            />
                        )
                    }}
                />
            </ChartContainer>
        </Block>
    )
}

const BarTooltip = props => {
    const { id, units, indexValue, data, i18nNamespace, shouldTranslate } = props
    const { getName } = useEntities()
    const { translate } = useI18n()
    const label = shouldTranslate
        ? translate(`options.${i18nNamespace}.${indexValue}`)
        : getName(indexValue)
    const nivoTheme = useNivoTheme()

    const units_ = id

    const round = id.split('___')[0]
    const roundLabel = translate(`options.bracket.${round}`)

    return (
        <div style={{ ...nivoTheme?.tooltip?.container, maxWidth: 300 }}>
            {label} ({roundLabel}):&nbsp;
            <strong>
                {data[units_]}
                {isPercentage(units) && '%'}
            </strong>
        </div>
    )
}

BracketWinsBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        dataPath: PropTypes.string.isRequired,
        showDescription: PropTypes.bool,
        translateData: PropTypes.bool,
        mode: PropTypes.oneOf(['absolute', 'relative']),
        defaultUnits: PropTypes.oneOf(['percentage_survey', 'percentage_question', 'count']),
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

export default memo(BracketWinsBlock)
