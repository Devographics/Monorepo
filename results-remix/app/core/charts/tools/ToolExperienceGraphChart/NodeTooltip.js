import React from 'react'
import { useI18n } from '@devographics/react-i18n'

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
