import React, { useMemo, useState } from 'react'
import get from 'lodash/get'
import compact from 'lodash/compact'
import round from 'lodash/round'
import sortBy from 'lodash/sortBy'
import Block from 'core/blocks/block/BlockVariant'
import { FeaturesCirclePackingChart } from 'core/charts/features/FeaturesCirclePackingChart'
import { useI18n } from 'core/i18n/i18nContext'
import ChartContainer from 'core/charts/ChartContainer'
import variables from 'Config/variables.yml'
import { getTableData } from 'core/helpers/datatables'
import { useLegends } from 'core/helpers/useBucketKeys'

const modes = ['grouped', 'awareness_rank', 'usage_rank' /*'usage_ratio_rank'*/]

const getNodeData = (feature, index) => {
    const buckets = get(feature, 'experience.year.facets.0.buckets')

    if (!buckets) {
        throw new Error(`Feature “${feature.id}” does not have any data associated.`)
    }

    let usageBucket = buckets.find(b => b.id === 'used')
    if (!usageBucket) {
        usageBucket = { count: 0 }
    }

    let knowNotUsedBucket = buckets.find(b => b.id === 'heard')
    if (!knowNotUsedBucket) {
        knowNotUsedBucket = { count: 0 }
    }

    const usage = usageBucket.count
    const awareness = usage + knowNotUsedBucket.count

    return {
        index,
        id: feature.id,
        awareness,
        usage,
        unused_count: knowNotUsedBucket.count,
        usage_ratio: round((usage / awareness) * 100, 1),
        name: feature.entity.name
    }
}

const addRanks = features => {
    const rankedByUsage = sortBy(features, 'usage').reverse()
    const rankedByAwareness = sortBy(features, 'awareness').reverse()
    const rankedByUsageRatio = sortBy(features, 'usage_ratio').reverse()
    const featuresWithRanks = features.map(f => ({
        ...f,
        usage_rank: rankedByUsage.findIndex(ff => ff.id === f.id),
        awareness_rank: rankedByAwareness.findIndex(ff => ff.id === f.id),
        usage_ratio_rank: rankedByUsageRatio.findIndex(ff => ff.id === f.id)
    }))
    return featuresWithRanks
}

const getChartData = (data, translate) => {
    const categories = variables.featuresCategories
    const sectionIds = Object.keys(categories)
    const allNodes = data.map((feature, index) => getNodeData(feature, index))
    const allNodesWithRanks = addRanks(allNodes)
    const sections = sectionIds.map(sectionId => {
        const sectionFeatures = categories[sectionId]
        let features = allNodesWithRanks.filter(f => sectionFeatures.includes(f.id))

        return features.length
            ? {
                  id: sectionId,
                  isSection: true,
                  children: features.map(f => ({ ...f, sectionId })),
                  name: translate(`sections.${sectionId}.title`)
              }
            : null
    })

    return {
        id: 'root',
        children: compact(sections)
    }
}

const FeaturesOverviewBlock = ({ block, data, triggerId, controlledMode }) => {
    const { translate } = useI18n()

    const chartData = useMemo(
        () => getChartData(data, translate),
        [data, translate]
    )

    const categories = chartData.children
    const legends = useLegends(
        block,
        categories.map(c => c.id),
        'features_categories'
    )

    const [mode, setMode] = useState(modes[0])

    const controlledCurrent = triggerId

    const { height = '800px' } = block

    const chartClassName = controlledCurrent
        ? `FeaturesOverviewChart--${controlledCurrent.join('_')}`
        : ''

    return (
        <Block
            block={{
                ...block,
                legendPosition: 'top',
                bucketKeysName: 'features_simplified'
            }}
            legends={legends}
            data={data}
            className="FeaturesOverviewBlock"
            tables={categories.map(category =>
                getTableData({
                    title: category.name,
                    data: sortBy(category.children, 'usage_ratio')
                        .reverse()
                        .map(f => ({ ...f, id: f?.name })),
                    valueKeys: ['awareness', 'usage', 'usage_ratio']
                })
            )}
            modeProps={{
                units: controlledMode || mode,
                options: modes,
                onChange: setMode,
                i18nNamespace: 'options.features_mode'
            }}
        >
            <ChartContainer vscroll={false} height={height}>
                <FeaturesCirclePackingChart
                    className={`FeaturesOverviewChart ${chartClassName}`}
                    data={chartData}
                    variant="allFeatures"
                    currentFeatureIds={controlledCurrent}
                    mode={controlledMode || mode}
                />
            </ChartContainer>
        </Block>
    )
}

export default FeaturesOverviewBlock
