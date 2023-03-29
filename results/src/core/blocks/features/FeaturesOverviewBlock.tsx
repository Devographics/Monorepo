import React, { useState } from 'react'
import compact from 'lodash/compact'
import round from 'lodash/round'
import sortBy from 'lodash/sortBy'
import Block from 'core/blocks/block/BlockVariant'
import { FeaturesCirclePackingChart } from 'core/charts/features/FeaturesCirclePackingChart'
import { useI18n } from 'core/i18n/i18nContext'
import ChartContainer from 'core/charts/ChartContainer'
import { getTableData } from 'core/helpers/datatables'
import { useLegends } from 'core/helpers/legends'
import { useFeatureSections } from 'core/helpers/metadata'
import { BlockComponentProps, BlockDefinition } from 'core/types'
import { AllFeaturesData, QuestionMetadata, ToolQuestionData } from '@devographics/types'

const modes = ['grouped', 'awareness_rank', 'usage_rank' /*'usage_ratio_rank'*/]

const getNodeData = (question: QuestionMetadata, questionData: ToolQuestionData, index: number) => {
    const buckets = questionData.responses.currentEdition.buckets
    if (!buckets) {
        throw new Error(`Feature “${questionData.id}” does not have any data associated.`)
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
        ...question,
        ...questionData,
        index,
        id: questionData.id,
        awareness,
        usage,
        unused_count: knowNotUsedBucket.count,
        usage_ratio: round((usage / awareness) * 100, 1),
        name: question?.entity?.nameClean || question?.entity?.name
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

const useChartData = (data: ToolQuestionData[], translate: any) => {
    const featureSections = useFeatureSections()
    const allFeatureQuestions = featureSections
        .map(s => s.questions.map(q => ({ ...q, sectionId: s.id })))
        .flat()
    const allNodes = allFeatureQuestions.map((q, i) => {
        return getNodeData(
            q,
            data.find(questionData => questionData.id === q.id),
            i
        )
    })
    const allNodesWithRanks = addRanks(allNodes)

    const sections = featureSections.map(section => {
        const sectionId = section.id
        const features = allNodesWithRanks.filter(n => n.sectionId === sectionId)

        return features.length
            ? {
                  id: sectionId,
                  isSection: true,
                  children: features,
                  name: translate(`sections.${sectionId}.title`)
              }
            : null
    })

    return {
        id: 'root',
        children: compact(sections)
    }
}

interface FeaturesOverviewBlockProps {
    block: BlockDefinition
    data: AllFeaturesData
    triggerId?: string
    controlledMode?: string
}

const FeaturesOverviewBlock = ({
    block,
    data: blockData,
    triggerId,
    controlledMode
}: FeaturesOverviewBlockProps) => {
    const { translate } = useI18n()

    const chartData = useChartData(blockData.items, translate)

    const categories = chartData.children
    const legends = useLegends({
        block,
        namespace: 'features_categories'
    })

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
            data={chartData}
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
