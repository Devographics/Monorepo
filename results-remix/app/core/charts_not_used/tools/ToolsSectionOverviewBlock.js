import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { useI18n } from '@devographics/react-i18n'
import ToolsSectionOverviewChart from 'core/charts/tools/ToolsSectionOverviewChart'

const ToolsSectionOverviewBlock = ({ block, data, units: defaultUnits = 'percentage' }) => {
    const [units, setUnits] = useState(defaultUnits)

    const [current, setCurrent] = useState(null)
    const { id, bucketKeysName = id } = block

    const { translate } = useI18n()
    const title = translate(`blocks.tools_section_overview.title`)
    const description = translate(`blocks.tools_section_overview.description`)

    // exclude tools having no aggregations available,
    // typically happens for previous years when new tools
    // were added.
    const filteredData = data.filter(datum => {
        if (datum.experience.year === null) {
            console.info(`[ToolsSectionOverviewBlock] no data available for tool: ${datum.id}`)
            return false
        }

        return true
    })

    return (
        <Block
            units={units}
            setUnits={setUnits}
            block={{
                ...block,
                title,
                description
            }}
            data={data}
            legendProps={{
                onMouseEnter: ({ id }) => {
                    setCurrent(id)
                },
                onMouseLeave: () => {
                    setCurrent(null)
                }
            }}
        >
            <ChartContainer height={400}>
                <ToolsSectionOverviewChart
                    data={filteredData}
                    units={units}
                    current={current}
                    namespace={bucketKeysName}
                />
            </ChartContainer>
        </Block>
    )
}

ToolsSectionOverviewBlock.propTypes = {
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
                }).isRequired
            })
        })
    ).isRequired
}

export default ToolsSectionOverviewBlock
