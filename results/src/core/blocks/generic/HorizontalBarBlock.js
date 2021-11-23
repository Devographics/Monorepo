import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/Block'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import { useI18n } from 'core/i18n/i18nContext'
import T from 'core/i18n/T'

const HorizontalBarBlock = ({ block, data }) => {
    const {
        id,
        mode = 'relative',
        defaultUnits = 'percentage_survey',
        translateData,
        i18nNamespace,
        colorVariant,
    } = block

    const [units, setUnits] = useState(defaultUnits)
    const [view, setView] = useState('viz')

    const { completion, buckets } = data

    const { total } = completion

    const { translate } = useI18n()

    return (
        <Block
            view={view}
            setView={setView}
            units={units}
            setUnits={setUnits}
            data={data}
            tables={[
                {
                    headings: [
                        { id: 'label', label: <T k="table.label" /> },
                        { id: 'percentage_survey', label: <T k="table.percentage" /> },
                        { id: 'count', label: <T k="table.count" /> },
                    ],
                    rows: data.buckets.map((bucket) => [
                        {
                            id: 'label',
                            label: bucket.entity
                                ? bucket.entity.name
                                : translate(`options.${i18nNamespace || id}.${bucket.id}`),
                        },
                        {
                            id: 'percentage_survey',
                            label: `${bucket.percentage_survey}%`,
                        },
                        {
                            id: 'count',
                            label: bucket.count,
                        },
                    ]),
                },
            ]}
            block={block}
        >
            <ChartContainer fit={true}>
                <HorizontalBarChart
                    total={total}
                    buckets={buckets}
                    i18nNamespace={i18nNamespace || id}
                    translateData={translateData}
                    mode={mode}
                    units={units}
                    colorVariant={colorVariant}
                />
            </ChartContainer>
        </Block>
    )
}

HorizontalBarBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        dataPath: PropTypes.string.isRequired,
        showDescription: PropTypes.bool,
        translateData: PropTypes.bool,
        mode: PropTypes.oneOf(['absolute', 'relative']),
        defaultUnits: PropTypes.oneOf(['percentage_survey', 'percentage_question', 'count']),
        colorVariant: PropTypes.oneOf(['primary', 'secondary']),
    }).isRequired,
    data: PropTypes.shape({
        buckets: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
            })
        ).isRequired,
    }).isRequired,
}

export default memo(HorizontalBarBlock)
