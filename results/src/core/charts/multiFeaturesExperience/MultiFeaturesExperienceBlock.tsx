import React, { useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import GaugeBarChart from 'core/charts_not_used/generic/GaugeBarChart'
import { usePageContext } from 'core/helpers/pageContext'
import { useLegends } from 'core/helpers/legends'
import { useI18n } from '@devographics/react-i18n'
import { getTableData } from 'core/helpers/datatables'
import Popover from 'core/components/Popover'
import CodeExample from 'core/components/CodeExample'
import { CodeIcon } from '@devographics/icons'
import T from 'core/i18n/T'
import './MultiFeaturesExperienceBlock.scss'

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
            <dl className="multiexp-row">
                {data.map(feature => (
                    <>
                        <dt className="multiexp-row-feature">
                            <FeatureName {...feature.entity} />
                        </dt>
                        <dd className="multiexp-row-chart">
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
                        </dd>
                    </>
                ))}
            </dl>
        </Block>
    )
}

const FeatureName = ({ name, homepage, example }) => (
    <div className="multiexp-feature-name-wrapper">
        {homepage?.url ? <a href={homepage.url}>{name}</a> : <span>{name}</span>}
        {example && (
            <div className="multiexp-popover-wrapper">
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
            </div>
        )}
    </div>
)

export default MultiFeaturesExperienceBlock
