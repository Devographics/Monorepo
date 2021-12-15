import { useMemo } from 'react'
import { useTheme } from 'styled-components'
import { keys } from 'core/bucket_keys'
import { useI18n } from 'core/i18n/i18nContext'
import { Block } from 'core/types/block'
import { stripHtml } from 'core/helpers/stripHtml'

const getColor = (colorRange, id) => {
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

export const useBucketKeys = bucketKeysId => {
    const theme = useTheme()
    const { translate, getString } = useI18n()
    const keysConfig = keys[bucketKeysId]
    if (!keysConfig) {
        throw new Error(`Could not find bucket keys config for: "${bucketKeysId}"`)
    }

    return useMemo(() => {
        let colorRange
        if (keysConfig.colorRange) {
            colorRange = theme.colors.ranges[keysConfig.colorRange]
        }

        return keysConfig.keys.map(key => {
            const label = translate(key.label)
            const shortLabelObject = getString(key.shortLabel)
            const shortLabel = shortLabelObject.missing ? undefined : shortLabelObject.t
            return {
                id: key.id,
                label,
                shortLabel,
                color: getColor(colorRange, key.id)?.color,
                gradientColors: getColor(colorRange, key.id)?.gradient
            }
        })
    }, [keysConfig, theme, translate])
}

export const useLegends = (block: Block, keys: string[], fieldId?: string) => {
    if (!keys || keys.length === 0) {
        return []
    }
    const theme = useTheme()
    const { translate, getString } = useI18n()

    const namespace = fieldId ?? block.chartNamespace ?? block.id
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
    return legends
}
