import React, { useMemo, useState } from 'react'
import get from 'lodash/get'
import compact from 'lodash/compact'
import Block from 'core/blocks/block/BlockVariant'
import FeaturesOverviewCirclePackingChart from 'core/charts/features/FeaturesOverviewCirclePackingChart'
import { useI18n } from 'core/i18n/i18nContext'
import { useEntities } from 'core/entities/entitiesContext'
import ChartContainer from 'core/charts/ChartContainer'
import variables from 'Config/variables.yml'

const getChartData = (data, getName, translate) => {
  const categories = variables.featuresCategories
    const sectionIds = Object.keys(categories)
    const sections = sectionIds.map((sectionId) => {
        const sectionFeatures = categories[sectionId]
        let features = data.filter((f) => sectionFeatures.includes(f.id))
        features = features.map((feature, index) => {

            const buckets = get(feature, 'experience.year.facets.0.buckets')

            if (!buckets) {
                throw new Error(`Feature “${feature.id}” does not have any data associated.`)
            }

            let usageBucket = buckets.find((b) => b.id === 'used')
            if (!usageBucket) {
                usageBucket = { count: 0 }
            }

            let knowNotUsedBucket = buckets.find((b) => b.id === 'heard')
            if (!knowNotUsedBucket) {
                knowNotUsedBucket = { count: 0 }
            }

            return {
                index,
                id: feature.id,
                awareness: usageBucket.count + knowNotUsedBucket.count,
                usage: usageBucket.count,
                unusedCount: knowNotUsedBucket.count,
                name: feature.name,
                sectionId,
            }
        })

        return features.length
            ? {
                  id: sectionId,
                  isSection: true,
                  children: features,
                  name: translate(`sections.${sectionId}.title`),
              }
            : null
    })

    return {
        id: 'root',
        children: compact(sections),
    }
}

const FeaturesOverviewBlock = ({ block, data, triggerId }) => {
    const { getName } = useEntities()
    const { translate } = useI18n()
    

    const chartData = useMemo(() => getChartData(data, getName, translate), [
        data,
        getName,
        translate,
    ])

    const controlledCurrent = triggerId

    const { height = '800px' } = block

    const chartClassName = controlledCurrent
        ? `FeaturesOverviewChart--${controlledCurrent.join('_')}`
        : ''
        
    const tables = [];

    const generateRows = (data) => {
      const rows = [];
      data.forEach((row) => {
        rows.push([{
          id: 'tech',
          label: row.name,
        }, {
          id: 'awareness',
          label: row.awareness,
        }, {
          id: 'usage',
          label: row.usage,
        }, {
          id: 'ratio',
          label: `${parseInt((row.usage / row.awareness) * 10000) / 100}%`,
        }])
      })
      return rows;
    };

    chartData.children.forEach((feature) => {
      tables.push({
        id: feature.id,
        title: feature.name,
        headings: [
          {id:'tech', label: translate('tools.technology')}, 
          {id:'awareness', label: translate('options.experience_ranking.awareness')}, 
          {id:'usage', label: translate('options.experience_ranking.usage')}, 
          {id:'ratio', label: translate('options.features_simplified.usage_ratio')}
        ],
        rows: generateRows(feature.children),
      })
    });

    return (
        <Block
            block={{
                ...block,
                showLegend: true,
                bucketKeysName: 'features_simplified',
            }}
            data={chartData}
            className="FeaturesOverviewBlock"
            showDescription={true}
            
            
            tables={tables}
        >
            <ChartContainer vscroll={false} height={height}>
                <FeaturesOverviewCirclePackingChart
                    className={`FeaturesOverviewChart ${chartClassName}`}
                    data={chartData}
                    variant="allFeatures"
                    current={controlledCurrent}
                />
            </ChartContainer>
        </Block>
    )
}

export default FeaturesOverviewBlock
