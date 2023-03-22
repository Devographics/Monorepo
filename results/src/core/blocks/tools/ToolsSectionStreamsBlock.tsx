import React, { useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import StreamChart from 'core/charts/generic/StreamChart'
import { useBucketKeys } from 'core/helpers/useBucketKeys'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import sortBy from 'lodash/sortBy'
import range from 'lodash/range'
import ToolLabel from 'core/charts/tools/ToolLabel'
import { useI18n } from 'core/i18n/i18nContext'
import { useLegends } from '../../helpers/useBucketKeys'
import { groupDataByYears, getTableData } from 'core/helpers/datatables'
import { BlockComponentProps } from 'core/types'
import { SectionAllToolsData, ToolQuestionData } from '@devographics/types'
import { useOptions } from 'core/helpers/options'
import { TOOLS_OPTIONS } from '@devographics/constants'
import { useEntities, getEntityName } from 'core/helpers/entities'

interface ToolsSectionStreamsBlockProps extends BlockComponentProps {
    data: SectionAllToolsData
}
const ToolsSectionStreamsBlock = ({
    block,
    data,
    triggerId,
    units: defaultUnits = 'percentageQuestion'
}: ToolsSectionStreamsBlockProps) => {
    const allEntities = useEntities()
    const [units, setUnits] = useState(defaultUnits)
    const [current, setCurrent] = useState(null)
    const { translate } = useI18n()

    const chartOptions = TOOLS_OPTIONS
    const legends = useLegends(block, chartOptions, 'tools')

    const filteredData = data.items.filter(item => item.responses.allEditions.length > 1)

    const controlledCurrent = triggerId || current

    return (
        <Block
            tables={filteredData.map(tool => {
                const entity = allEntities.find(e => e.id === tool.id)
                return getTableData({
                    id: block.id,
                    title: entity && getEntityName(entity),
                    data: groupDataByYears({
                        keys: chartOptions,
                        data: tool.responses.allEditions
                    }),
                    years: tool.responses.allEditions.map(y => y.year),
                    translateData: true,
                    i18nNamespace: 'tools'
                })
            })}
            units={units}
            setUnits={setUnits}
            block={{
                legendPosition: 'top',
                legendProps: { layout: 'horizontal' },
                ...block
            }}
            legends={legends}
            data={filteredData}
            legendProps={{
                current: controlledCurrent,
                onMouseEnter: ({ id }) => {
                    setCurrent(id)
                },
                onMouseLeave: () => {
                    setCurrent(null)
                }
            }}
        >
            <GridContainer count={filteredData.length}>
                {filteredData.map(itemData => {
                    return (
                        <Stream
                            key={itemData.id}
                            itemData={itemData}
                            current={controlledCurrent}
                            units={units}
                            legends={legends}
                            keys={chartOptions}
                        />
                    )
                })}
            </GridContainer>
        </Block>
    )
}

interface StreamProps {
    itemData: ToolQuestionData
}

const Stream = ({ itemData, current, units, keys, legends }: StreamProps) => {
    const chartData = itemData.responses.allEditions.map(edition => ({
        year: edition.year,
        buckets: edition.buckets
    }))
    const colors = legends.map(key => key.color)

    return (
        <StreamItem>
            <StreamChart
                colorScale={colors}
                current={current}
                // for tools only having one year of data, we duplicate the year's data
                // to be able to use the stream chart.
                data={chartData.length === 1 ? [chartData[0], chartData[0]] : chartData}
                keys={keys}
                bucketKeys={legends}
                units={units}
                applyEmptyPatternTo="never_heard"
                i18nNamespace="tools"
                showLabels={false}
                showYears={false}
                height={160}
            />
            <StreamTitle>
                <ToolLabel id={itemData.id} />
            </StreamTitle>
        </StreamItem>
    )
}

const minCols = 3
const maxCols = 4
const getColNumber = count => {
    // calculate number of items on the last line for 3, 4, or 5 columns
    // note: we give modulo 0 a higher "score" of 999
    const colOptions = range(minCols, maxCols + 1).map(cols => ({
        cols,
        itemsOnLastLine: count % cols || 999
    }))
    // take the option with the most number of orphans
    const bestOption = sortBy(colOptions, ['itemsOnLastLine']).reverse()[0]
    return bestOption.cols
}

const GridContainer = styled.div`
    @media ${mq.small} {
        margin-bottom: ${spacing(2)};
    }

    @media ${mq.mediumLarge} {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(${props => getColNumber(props.count)}, 1fr);
        column-gap: ${spacing(2)};
        row-gap: ${spacing(2)};
    }
`

const StreamItem = styled.div`
    @media ${mq.small} {
        margin-bottom: ${spacing(2)};
    }
`

const StreamTitle = styled.h4`
    text-align: center;
    font-size: ${fontSize('smallish')};
    margin-bottom: 0;
`

export default ToolsSectionStreamsBlock
