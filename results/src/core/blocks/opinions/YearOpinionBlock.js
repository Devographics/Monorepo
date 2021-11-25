import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import VerticalBarChart from 'core/charts/generic/VerticalBarChart'
import { useI18n } from 'core/i18n/i18nContext'
import { usePageContext } from 'core/helpers/pageContext'
import {
    StronglyDisagreeIcon,
    DisagreeIcon,
    NeutralIcon,
    AgreeIcon,
    StronglyAgreeIcon,
} from '../components/icons'

const emojiIcons = [StronglyDisagreeIcon, DisagreeIcon, NeutralIcon, AgreeIcon, StronglyAgreeIcon]

/* eslint-disable jsx-a11y/accessible-emoji */
const Emojis = ({ bars, size = 24 }) => (
    <>
        {bars.map((bar, i) => {
            const Emoji = emojiIcons[i]
            if (Emoji === null) {
                return null
            } else {
                return (
                    <g transform={`translate(${bar.x + bar.width / 2 - size / 2}, ${bar.y - 35})`}>
                        <Emoji size={size} />
                    </g>
                )
            }
        })}
    </>
)

const formatTick = (translate) => (value) => {
    return translate(`opinion_scale.${value}.long`)
}

const YearOpinionBlock = ({ block, data }) => {
    const context = usePageContext()
    const { width } = context
    const { translate } = useI18n()

    const { units: defaultUnits = 'percentage', translateData } = block
    const [units, setUnits] = useState(defaultUnits)
    

    const getScaleTickLabel = formatTick(translate)

    const buckets = data.buckets

    return (
        <Block
            id={block.id}
            
            
            showDescription={true}
            units={units}
            setUnits={setUnits}
            completion={data.completion}
        >
            <ChartContainer fit={true}>
                <VerticalBarChart
                    className="OpinionScaleChart"
                    buckets={buckets}
                    i18nNamespace="opinion_scale"
                    units={units}
                    translateData={translateData}
                    chartProps={{
                        axisBottom: {
                            format: getScaleTickLabel,
                            tickRotation: width && width < 500 ? -45 : 0,
                        },
                        layers: ['grid', 'axes', 'bars', Emojis],
                    }}
                    viewportWidth={width}
                />
            </ChartContainer>
        </Block>
    )
}

YearOpinionBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        dataPath: PropTypes.string,
        showDescription: PropTypes.bool,
    }).isRequired,
    data: PropTypes.shape({
        year: PropTypes.number.isRequired,
        completion: PropTypes.shape({
            count: PropTypes.number.isRequired,
            percentage: PropTypes.number.isRequired,
        }).isRequired,
        buckets: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number.isRequired,
                count: PropTypes.number.isRequired,
                percentage: PropTypes.number,
            })
        ).isRequired,
    }).isRequired,
}

export default memo(YearOpinionBlock)
