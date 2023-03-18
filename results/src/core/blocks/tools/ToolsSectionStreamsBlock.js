import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
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

const ToolsSectionStreamsBlock = ({
    block,
    data,
    keys,
    triggerId,
    units: defaultUnits = 'percentageQuestion'
}) => {
    const [units, setUnits] = useState(defaultUnits)

    const [current, setCurrent] = useState(null)
    const { translate } = useI18n()

    const legends = useLegends(block, keys, 'tools')

    const filteredData = data.filter(toolData => toolData.experience.all_years.length > 1)

    const controlledCurrent = triggerId || current

    return (
        <Block
            tables={filteredData.map(tool =>
                getTableData({
                    title: tool?.entity?.name,
                    data: groupDataByYears({ keys, data: tool.experience.all_years }),
                    years: tool.experience.all_years.map(y => y.year),
                    translateData: true,
                    i18nNamespace: 'tools'
                })
            )}
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
                {filteredData.map(toolData => {
                    return (
                        <Stream
                            key={toolData.id}
                            toolData={toolData}
                            current={controlledCurrent}
                            units={units}
                            legends={legends}
                            keys={keys}
                        />
                    )
                })}
            </GridContainer>
        </Block>
    )
}

const Stream = ({ toolData, current, units, keys, legends }) => {
    const chartData = toolData.experience.all_years.map(year => ({
        year: year.year,
        buckets: year.facets[0].buckets
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
                <ToolLabel id={toolData.id} entity={toolData.entity} />
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

ToolsSectionStreamsBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired
    }).isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            entity: PropTypes.shape({
                name: PropTypes.string.isRequired
            }).isRequired,
            experience: PropTypes.shape({
                year: PropTypes.shape({
                    buckets: PropTypes.arrayOf(
                        PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            count: PropTypes.number.isRequired,
                            percentage: PropTypes.number.isRequired
                        })
                    ).isRequired
                })
            })
        })
    ).isRequired
}

export default ToolsSectionStreamsBlock
