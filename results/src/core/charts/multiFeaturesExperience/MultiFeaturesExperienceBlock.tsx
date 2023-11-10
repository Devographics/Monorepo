import React, { useState } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import styled from 'styled-components'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import GaugeBarChart from 'core/charts_not_used/generic/GaugeBarChart'
import { usePageContext } from 'core/helpers/pageContext'
import { useLegends } from 'core/helpers/legends'
import { mq, spacing } from 'core/theme'
import { useI18n } from 'core/i18n/i18nContext'
import { getTableData, groupDataByYears } from 'core/helpers/datatables'
import Popover from 'core/components/Popover'
import CodeExample from 'core/components/CodeExample'
import { CodeIcon } from 'core/icons'
import T from 'core/i18n/T'

// convert relative links into absolute MDN links
const parseMDNLinks = content =>
    content.replace(new RegExp(`href="/`, 'g'), `href="https://developer.mozilla.org/`)

export const MultiFeaturesExperienceBlock = ({
    block,
    keys,
    data,
    i18nNamespace = 'features',
    units: defaultUnits = 'percentageQuestion'
}) => {
    const [units, setUnits] = useState(defaultUnits)

    const context = usePageContext()
    const { locale } = context
    // const { name, mdn } = data
    const { translate } = useI18n()

    // const allYears = get(data, 'experience.all_years', [])

    const bucketKeys = useLegends({ block })

    // const mdnLink = mdn && `https://developer.mozilla.org${mdn.url}`
    // only show descriptions for english version
    // const description = locale.id === 'en-US' && mdn && parseMDNLinks(mdn.summary)

    // const isLastYear = year => allYears.findIndex(y => y.year === year.year) === allYears.length - 1
    if (!data) {
        return <div>no data</div>
    }
    return (
        <Block
            tables={data.map(feature =>
                getTableData({
                    title: feature.entity.name,
                    legends: bucketKeys,
                    data: feature.experience.year.facets[0].buckets
                })
            )}
            legends={bucketKeys}
            units={units}
            setUnits={setUnits}
            data={data}
            block={block}
        >
            <Row>
                {data.map(feature => (
                    <>
                        <RowFeature>
                            <FeatureName {...feature.entity} />
                        </RowFeature>
                        <RowChart className="FeatureExperienceBlock__RowChart">
                            <ChartContainer height={40} fit={true} className="FeatureChart">
                                <GaugeBarChart
                                    keys={keys}
                                    buckets={feature?.experience?.year?.facets[0]?.buckets}
                                    colorMapping={bucketKeys}
                                    units={units}
                                    applyEmptyPatternTo="never_heard"
                                    i18nNamespace={i18nNamespace}
                                />
                            </ChartContainer>
                        </RowChart>
                    </>
                ))}
            </Row>
        </Block>
    )
}

const FeatureName = ({ name, homepage, example }) => (
    <FeatureNameWrapper>
        {homepage?.url ? <a href={homepage.url}>{name}</a> : <span>{name}</span>}
        {example && (
            <PopoverWrapper>
                <Popover
                    trigger={
                        <span>
                            <CodeIcon label={<T k="general.view_code_example" />} />
                        </span>
                    }
                    addPadding={false}
                >
                    <CodeExample {...example} />
                </Popover>
            </PopoverWrapper>
        )}
    </FeatureNameWrapper>
)

const FeatureNameWrapper = styled.div`
    display: flex;
    align-items: center;
`

const PopoverWrapper = styled.div`
    margin-left: ${spacing(0.5)};
`

const Row = styled.dl`
    display: grid;
    grid-template-columns: minmax(200px, auto) 1fr;
    column-gap: ${spacing()};
    row-gap: ${spacing(0.5)};
    align-items: center;
    /* margin-bottom: ${spacing()}; */
`

const RowFeature = styled.dt`
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

export default MultiFeaturesExperienceBlock
