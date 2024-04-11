import { useTheme } from 'styled-components'
import { useI18n } from '@devographics/react-i18n'
import { BlockLegend, BlockVariantDefinition } from 'core/types/block'
import { stripHtml } from 'core/helpers/utils'
import { useOptions } from 'core/helpers/options'

export const getColor = (colorRange, id) => {
    if (!colorRange) {
        return
    }
    const color = colorRange[id]
    if (Array.isArray(color)) {
        return { color: color[0], gradient: color }
    } else {
        return { color, gradient: [color, color] }
    }
}

const getNoAnswerKey = (theme: any, translate: any) => ({
    id: 'no_answer',
    label: translate('charts.no_answer'),
    shortLabel: translate('charts.no_answer'),
    color: theme.colors.no_answer[0],
    gradientColors: theme.colors.no_answer
})

export const useLegends = ({
    block,
    legendIds,
    namespace: providedNamespace,
    addNoAnswer = false
}: {
    block: BlockVariantDefinition
    legendIds?: string[]
    namespace?: string
    addNoAnswer?: boolean
}): BlockLegend[] => {
    const keys = legendIds || useOptions(block.fieldId || block.id)

    if (!keys || keys.length === 0) {
        return []
    }
    const theme = useTheme()
    const { translate, getString } = useI18n()

    const namespace = providedNamespace ?? block.i18nNamespace ?? block.fieldId ?? block.id
    const colorRange = theme.colors.ranges[namespace]
    const legends = keys.map(id => {
        const labelKey = `options.${namespace}.${id}`
        const shortLabelKey = labelKey + '.short'
        const label = stripHtml(translate(labelKey))
        const shortLabelObject = getString(shortLabelKey)
        const shortLabel = shortLabelObject.missing ? undefined : shortLabelObject.t
        const legend = {
            id,
            label,
            shortLabel,
            color: getColor(colorRange, id)?.color,
            gradientColors: getColor(colorRange, id)?.gradient
        }
        return legend
    })

    return addNoAnswer ? [...legends, getNoAnswerKey(theme, translate)] : legends
}
