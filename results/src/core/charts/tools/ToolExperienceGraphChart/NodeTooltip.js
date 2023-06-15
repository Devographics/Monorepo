import React from 'react'
import { useI18n } from 'core/i18n/i18nContext'

const NodeTooltip = node => {
    const { translate } = useI18n()

    return (
        <div>
            {translate('toolExperienceGraph.node.tooltip', {
                values: {
                    count: node.value,
                    year: node.year,
                    experience: translate(`toolExperience.${node.experience}.long`)
                }
            })}
        </div>
    )
}

export default NodeTooltip
