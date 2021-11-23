import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/Block'
import ChartContainer from 'core/charts/ChartContainer'
import ParticipationByCountryChart from 'core/charts/demographics/ParticipationByCountryChart'
import countries from 'data/geo/world_countries'
import T from 'core/i18n/T'

const ParticipationByCountryBlock = ({
    block,
    data,
    triggerId,
    units: defaultUnits = 'percentage_survey',
}) => {
    const [units, setUnits] = useState(defaultUnits)
    const [view, setView] = useState('viz')

    const chartClassName = triggerId ? `ParticipationByCountryChart--${triggerId}` : ''

    const { height = 500 } = block

    const tables = [{
      headings: [{id: 'label', label: <T k='table.label' />}, {id: 'percentage', label: <T k='table.percentage' />}, {id: 'count', label: <T k='table.count' />}],
      rows: data.buckets.map((bucket) => ([{
        id: 'label',
        label: countries.features.find((country) => country.id === bucket.id)?.properties.name,
      }, {
        id: 'percentage',
        label: `${bucket.percentage_survey}%`,
      }, {
        id: 'count',
        label: bucket.count,
      }]))
    }];

    return (
        <Block tables={tables} view={view} setView={setView} units={units} setUnits={setUnits} data={data} block={block}>
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
