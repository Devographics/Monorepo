import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import ParticipationByCountryChart from 'core/charts/demographics/ParticipationByCountryChart'
import { getTableData } from 'core/helpers/datatables'
import { getCountryName } from 'core/helpers/countries'

const ParticipationByCountryBlock = ({
    block,
    data,
    triggerId,
    units: defaultUnits = 'percentage_survey',
}) => {
    const [units, setUnits] = useState(defaultUnits)

    const chartClassName = triggerId ? `ParticipationByCountryChart--${triggerId}` : ''

    return (
        <Block
            tables={[
                getTableData({
                    data: data.buckets.map((b) => ({ ...b, label: getCountryName(b.id) })),
                }),
            ]}
            units={units}
            setUnits={setUnits}
            data={data}
            block={block}
        >
            <ChartContainer height={600}>
                <div
                    style={{ height: '100%' }}
                    className={`ParticipationByCountryChart ${chartClassName}`}
                >
                    <ParticipationByCountryChart units={units} data={data.buckets} />
                </div>
            </ChartContainer>
        </Block>
    )
}

ParticipationByCountryBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
    data: PropTypes.shape({
        completion: PropTypes.shape({
            count: PropTypes.number.isRequired,
            percentage_survey: PropTypes.number.isRequired,
        }).isRequired,
        buckets: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                count: PropTypes.number.isRequired,
                percentage_survey: PropTypes.number.isRequired,
                percentage_question: PropTypes.number.isRequired,
            })
        ).isRequired,
    }).isRequired,
}

export default memo(ParticipationByCountryBlock)
