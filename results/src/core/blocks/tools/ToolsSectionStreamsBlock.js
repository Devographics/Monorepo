import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/Block'
import StreamChart from 'core/charts/generic/StreamChart'
import { useBucketKeys } from 'core/helpers/useBucketKeys'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import sortBy from 'lodash/sortBy'
import range from 'lodash/range'
import ToolLabel from 'core/charts/tools/ToolLabel'
import { useI18n } from 'core/i18n/i18nContext'

const ToolsSectionStreamsBlock = ({
    block,
    data,
    keys,
    triggerId,
    units: defaultUnits = 'percentage_question',
}) => {
    const [units, setUnits] = useState(defaultUnits)
    const [view, setView] = useState('viz')
    const [current, setCurrent] = useState(null)
    const { translate } = useI18n()

    const filteredData = data.filter((toolData) => toolData.experience.all_years.length > 1)

    const controlledCurrent = triggerId || current

    let headings = [{ id: 'label', label: translate('table.year') }]
    headings = headings.concat(
        data[0].experience.all_years[0].facets[0].buckets.map((bucket) => ({
            id: bucket.id,
            label: translate(`options.tools.${bucket.id}.short`),
        }))
    )

    const generateRows = (data) => {
        const rows = []
        // data.forEach((row) => {
        //     const newRow = []
        //     newRow.push({ id: 'label', label: row.year })
        //     row.facets[0].buckets.forEach((bucket) =>
        //         newRow.push({ id: bucket.id, label: `${bucket.percentage}% (${bucket.count})` })
        //     )
        //     rows.push(newRow)
        // })
        return rows
    }

    const tables = data.map((table) => ({
        id: table.id,
        title: table.entity.name,
        headings: headings,
        rows: generateRows(table.experience.all_years),
    }))

    return (
        <Block
            tables={tables}
            view={view}
            setView={setView}
            units={units}
            setUnits={setUnits}
            block={{
                legendPosition: 'top',
                legendProps: { layout: 'horizontal' },
                ...block,
            }}
            data={filteredData}
            legendProps={{
                current: controlledCurrent,
                onMouseEnter: ({ id }) => {
                    setCurrent(id)
                },
                onMouseLeave: () => {
                    setCurrent(null)
                },
            }}
        >
            <GridContainer count={filteredData.length}>
                {filteredData.map((toolData) => {
                    return (
                        <Stream
                            key={toolData.id}
                            toolData={toolData}
                            current={controlledCurrent}
                            units={units}
                        />
                    )
                })}
            </GridContainer>
        </Block>
    )
}

const Stream = ({ toolData, current, units }) => {
    const chartData = toolData.experience.all_years.map(year => year.facets[0])
    const bucketKeys = useBucketKeys('tools')
    const colors = useMemo(() => bucketKeys.map((key) => key.color), [bucketKeys])

    return (
        <StreamItem>
            <StreamChart
                colorScale={colors}
                current={current}
                // for tools only having one year of data, we duplicate the year's data
                // to be able to use the stream chart.
                data={chartData.length === 1 ? [chartData[0], chartData[0]] : chartData}
                keys={bucketKeys.map((k) => k.id)}
                bucketKeys={bucketKeys}
                units={units}
                applyEmptyPatternTo="never_heard"
                namespace="options.tools"
                showLabels={false}
                showYears={false}
                height={160}
            />
            <StreamTitle>
                <ToolLabel id={toolData.id} />
            </StreamTitle>
        </StreamItem>
    )
}

const minCols = 4
const maxCols = 5
const getColNumber = (count) => {
    // calculate number of items on the last line for 3, 4, or 5 columns
    // note: we give modulo 0 a higher "score" of 999
    const colOptions = range(minCols, maxCols + 1).map((cols) => ({
        cols,
        itemsOnLastLine: count % cols || 999,
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
        grid-template-columns: repeat(${(props) => getColNumber(props.count)}, 1fr);
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
        id: PropTypes.string.isRequired,
    }).isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            entity: PropTypes.shape({
                name: PropTypes.string.isRequired,
            }).isRequired,
            experience: PropTypes.shape({
                year: PropTypes.shape({
                    buckets: PropTypes.arrayOf(
                        PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            count: PropTypes.number.isRequired,
                            percentage: PropTypes.number.isRequired,
                        })
                    ).isRequired,
                }),
            }),
        })
    ).isRequired,
}

export default ToolsSectionStreamsBlock
