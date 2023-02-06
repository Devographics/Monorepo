import React, { useState } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import styled from 'styled-components'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import GaugeBarChart from 'core/charts/generic/GaugeBarChart'
import { usePageContext } from 'core/helpers/pageContext'
import { useLegends } from 'core/helpers/useBucketKeys'
import { mq, spacing } from 'core/theme'
import { useI18n } from 'core/i18n/i18nContext'
import { getTableData, groupDataByYears } from 'core/helpers/datatables'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { MODE_GRID } from 'core/blocks/filters/constants'

// convert relative links into absolute MDN links
const parseMDNLinks = content =>
    content.replace(new RegExp(`href="/`, 'g'), `href="https://developer.mozilla.org/`)

const processBlockData = data => {
    const allYears = get(data, 'experience.all_years', [])
    return allYears.map(year => ({ year: year.year, buckets: year.facets[0].buckets }))
}

const FeatureExperienceBlock = ({
    block,
    keys,
    data,
    chartNamespace = 'features',
    units: defaultUnits = 'percentage_question'
}) => {
    const [units, setUnits] = useState(defaultUnits)

    const context = usePageContext()
    const { locale } = context
    const { name, mdn } = data
    const { translate } = useI18n()

    const allYears = get(data, 'experience.all_years', [])

    const bucketKeys = useLegends(block, keys)

    const mdnLink = mdn && `https://developer.mozilla.org${mdn.url}`
    // only show descriptions for english version
    const description = locale.id === 'en-US' && mdn && parseMDNLinks(mdn.summary)

    const buckets = processBlockData(data)

    const { chartFilters, setChartFilters } = useChartFilters({block, options: { supportedModes: [MODE_GRID], enableYearSelect: false }})

    return (
        <Block
            tables={[
                getTableData({
                    legends: bucketKeys,
                    data: groupDataByYears({ keys, data: allYears }),
                    years: allYears.map(y => y.year)
                })
            ]}
            legends={bucketKeys}
            title={name}
            units={units}
            setUnits={setUnits}
            originalData={data}
            data={allYears}
            block={{
                ...block,
                title: name,
                titleLink: mdnLink,
                description,
                enableDescriptionMarkdown: false
            }}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
        >
            <DynamicDataLoader
                defaultBuckets={buckets}
                block={block}
                chartFilters={chartFilters}
                layout="grid"
                processBlockData={processBlockData}
                processBlockDataOptions={{}}
            >
                <FeatureExperienceChart
                    keys={keys}
                    buckets={buckets}
                    bucketKeys={bucketKeys}
                    units={units}
                    chartNamespace={chartNamespace}
                />
            </DynamicDataLoader>
        </Block>
    )
}

const FeatureExperienceChart = ({ buckets: years, keys, bucketKeys, units, chartNamespace }) => {
    const isLastYear = year => years.findIndex(y => y.year === year) === years.length - 1

    return (
        <dl>
            {years.map(year => (
                <Row key={year.year}>
                    <RowYear>{year.year}</RowYear>
                    <RowChart className="FeatureExperienceBlock__RowChart">
                        <ChartContainer
                            height={isLastYear(year.year) ? 40 : 40}
                            fit={true}
                            className="FeatureChart"
                        >
                            <GaugeBarChart
                                keys={keys}
                                buckets={year.buckets}
                                colorMapping={bucketKeys}
                                units={units}
                                applyEmptyPatternTo="never_heard"
                                i18nNamespace={chartNamespace}
                                showProgression={isLastYear(year.year)}
                            />
                        </ChartContainer>
                    </RowChart>
                </Row>
            ))}
        </dl>
    )
}
const Row = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: ${spacing()};
    align-items: center;
    margin-bottom: ${spacing()};
`

const RowYear = styled.dt`
    font-weight: bold;
    margin: 0;
`
const RowChart = styled.dd`
    margin: 0;

    @media ${mq.smallMedium} {
        max-width: calc(
            100vw - 40px - 30px - 20px
        ); /* total width - page padding - year width - gap */
    }
`

FeatureExperienceBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired
    }).isRequired,
    data: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        experience: PropTypes.shape({
            all_years: PropTypes.arrayOf(
                PropTypes.shape({
                    year: PropTypes.number.isRequired,
                    completion: PropTypes.shape({
                        count: PropTypes.number.isRequired,
                        percentage: PropTypes.number.isRequired
                    }).isRequired,
                    buckets: PropTypes.arrayOf(
                        PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            usage: PropTypes.shape({
                                total: PropTypes.number.isRequired,
                                buckets: PropTypes.arrayOf(
                                    PropTypes.shape({
                                        id: PropTypes.string.isRequired,
                                        count: PropTypes.number.isRequired,
                                        percentage: PropTypes.number.isRequired
                                    })
                                ).isRequired
                            })
                        })
                    ).isRequired
                })
            ).isRequired
        }).isRequired
    }).isRequired
}

export default FeatureExperienceBlock
