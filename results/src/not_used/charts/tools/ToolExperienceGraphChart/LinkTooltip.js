import React from 'react'
import { useI18n } from '@devographics/react-i18n'

const LinkTooltip = link => {
    const { translate } = useI18n()

    return (
        <div>
            {translate('toolExperienceGraph.link.tooltip', {
                values: {
                    count: link.value,
                    previousYear: link.source.year,
                    previousExperience: translate(`toolExperience.${link.source.experience}.short`),
                    nextYear: link.target.year,
                    nextExperience: translate(`toolExperience.${link.target.experience}.short`)
                }
            })}
        </div>
    )
}

export default LinkTooltip
