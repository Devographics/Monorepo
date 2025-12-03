import './SubsetControls.scss'
import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { MultiRatiosChartState, MultiRatioSerie } from './types'
import { BlockComponentProps, PageContextValue } from 'core/types'
import { viewDefinition } from './helpers/viewDefinition'
import { SubsetPresets } from './helpers/subsets'
import { Toggle, ToggleItemType, ToggleMode } from '../common2'
import T from 'core/i18n/T'
import { SectionMetadata } from '@devographics/types'
import intersection from 'lodash/intersection'

export const SubsetControls = ({
    chartState,
    i18nNamespace,
    pageContext,
    series,
    question
}: {
    chartState: MultiRatiosChartState
    i18nNamespace?: string
    pageContext: PageContextValue
    series: MultiRatioSerie[]
    question: BlockComponentProps['question']
}) => {
    const { highlighted, setSubset } = chartState

    // assume we're only dealing with a single serie for now
    const serie = series[0]
    const { getLineItems } = viewDefinition
    const items = getLineItems({ serie, question, chartState })
    const itemsWithIndex = items.map((item, itemIndex) => ({ ...item, itemIndex }))

    const allSections = pageContext.currentEdition.sections

    // keep only the sections that contain items we're showing in the chart
    const itemSections = allSections.filter(section => {
        const sectionQuestionIds = section.questions.map(q => q.id)
        const allItemIds = itemsWithIndex.map(i => i.id)
        return intersection(sectionQuestionIds, allItemIds).length > 0
    })

    const hasHighlight = highlighted !== null

    return (
        <div
            className={`chart-legend-multiSection chart-legend-${
                hasHighlight ? 'hasHighlight' : 'noHighlight'
            }`}
        >
            <AllPresets
                chartState={chartState}
                sections={itemSections}
                i18nNamespace={i18nNamespace}
            />
            {/* <Presets chartState={chartState} />
            <Sections
                chartState={chartState}
                sections={itemSections}
                i18nNamespace={i18nNamespace}
            /> */}
        </div>
    )
}

const AllPresets = ({
    sections,
    chartState,
    i18nNamespace
}: {
    chartState: MultiRatiosChartState
    sections: SectionMetadata[]
    i18nNamespace?: string
}) => {
    const { getString } = useI18n()
    const { subset, setSubset } = chartState
    const generalPresets: ToggleItemType[] = Object.values(SubsetPresets).map(id => {
        const labelKey = `charts.subsets.${id}`
        const descriptionKey = `${labelKey}.description`
        const item: ToggleItemType = {
            id,
            isEnabled: subset === id,
            labelKey,
            label: getString(labelKey)?.t
        }
        const description = getString(descriptionKey)
        if (description) {
            item.tooltip = <T k={descriptionKey} html={true} md={true} />
        }
        return item
    })
    const sectionPresets: ToggleItemType[] = sections.map(section => {
        const { id } = section
        const labelKey = `${i18nNamespace}.${id}`
        const descriptionKey = `${labelKey}.description`
        const item: ToggleItemType = {
            id,
            isEnabled: subset === id,
            labelKey,
            label: getString(labelKey)?.t
        }
        const description = getString(descriptionKey)
        if (!description.missing) {
            item.tooltip = <T k={descriptionKey} html={true} md={true} />
        }
        return item
    })
    return (
        <div className="subset-controls-group subset-controls-group-sections">
            <Toggle
                labelId="charts.subsets.filters"
                handleSelect={setSubset}
                items={[...generalPresets, ...sectionPresets]}
            />
        </div>
    )
}

const Presets = ({ chartState }: { chartState: MultiRatiosChartState }) => {
    const { getString } = useI18n()
    const { subset, setSubset } = chartState
    const items: ToggleItemType[] = Object.values(SubsetPresets).map(id => {
        const labelKey = `charts.subsets.${id}`
        const descriptionKey = `${labelKey}.description`
        const item: ToggleItemType = {
            id,
            isEnabled: subset === id,
            labelKey,
            label: getString(labelKey)?.t
        }
        const description = getString(descriptionKey)
        if (description) {
            item.tooltip = <T k={descriptionKey} html={true} md={true} />
        }
        return item
    })
    return (
        <div className="subset-controls-group subset-controls-group-presets">
            <Toggle labelId="charts.subsets.presets" handleSelect={setSubset} items={items} />
        </div>
    )
}

const Sections = ({
    sections,
    chartState,
    i18nNamespace
}: {
    chartState: MultiRatiosChartState
    sections: SectionMetadata[]
    i18nNamespace?: string
}) => {
    const { getString } = useI18n()
    const { subset, setSubset } = chartState
    const items: ToggleItemType[] = sections.map(section => {
        const { id } = section
        const labelKey = `${i18nNamespace}.${id}`
        const descriptionKey = `${labelKey}.description`
        const item: ToggleItemType = {
            id,
            isEnabled: subset === id,
            labelKey,
            label: getString(labelKey)?.t
        }
        const description = getString(descriptionKey)
        if (!description.missing) {
            item.tooltip = <T k={descriptionKey} html={true} md={true} />
        }
        return item
    })
    return (
        <div className="subset-controls-group subset-controls-group-sections">
            <Toggle labelId="charts.subsets.sections" handleSelect={setSubset} items={items} />
        </div>
    )
}

export default SubsetControls
