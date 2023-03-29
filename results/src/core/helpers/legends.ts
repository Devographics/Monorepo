import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import { BlockLegend, BlockDefinition } from 'core/types/block'
import { stripHtml } from 'core/helpers/stripHtml'
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

// export const useBucketKeys = (bucketKeysId, addNoAnswer = false) => {
//     const theme = useTheme()
//     const { translate, getString } = useI18n()
//     const keysConfig = keys[bucketKeysId]
//     if (!keysConfig) {
//         throw new Error(`Could not find bucket keys config for: "${bucketKeysId}"`)
//     }

//     return useMemo(() => {
//         let colorRange
//         if (keysConfig.colorRange) {
//             colorRange = theme.colors.ranges[keysConfig.colorRange]
//         }

//         const keys = keysConfig.keys.map(key => {
//             const label = translate(key.label)
//             const shortLabelObject = getString(key.shortLabel)
//             const shortLabel = shortLabelObject.missing ? undefined : shortLabelObject.t
//             return {
//                 id: key.id,
//                 label,
//                 shortLabel,
//                 color: getColor(colorRange, key.id)?.color,
//                 gradientColors: getColor(colorRange, key.id)?.gradient
//             }
//         })

//         return addNoAnswer ? [...keys, getNoAnswerKey(theme, translate)] : keys
//     }, [keysConfig, theme, translate])
// }

export const useLegends = ({
    block,
    namespace: providedNamespace,
    addNoAnswer = false
}: {
    block: BlockDefinition
    namespace?: string
    addNoAnswer?: boolean
}): BlockLegend[] => {
    const keys = useOptions(block.id)

    if (!keys || keys.length === 0) {
        return []
    }
    const theme = useTheme()
    const { translate, getString } = useI18n()

    const namespace = providedNamespace ?? block.chartNamespace ?? block.id
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
