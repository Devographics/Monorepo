import React from 'react'
import { Control } from '../horizontalBar2/types'
import T from 'core/i18n/T'
import { useI18n } from '@devographics/react-i18n'
import { CommonProps } from './types'
import './Controls.scss'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'

export const Controls = ({
    controls,
    chartState
}: {
    controls: Control[]
} & CommonProps) => {
    const { facet } = chartState
    const { getString } = useI18n()
    const axisLabel = facet && getString(`${facet.sectionId}.${facet.id}`)?.t
    return (
        <div className="chart-controls" role="tablist" aria-orientation="horizontal">
            <ButtonGroup>
                {controls.map(control => {
                    const { id, labelId, onClick, isChecked, icon } = control
                    const IconComponent = icon
                    return (
                        <Button
                            key={id}
                            size="small"
                            className={`chart-control-button Button--${
                                isChecked ? 'selected' : 'unselected'
                            }`}
                            data-state={isChecked ? 'active' : 'inactive'}
                            onClick={onClick}
                            aria-pressed={isChecked}
                        >
                            <IconComponent size="petite" />
                            <T k={labelId} values={{ axis: axisLabel }} />
                        </Button>
                    )
                })}
            </ButtonGroup>
        </div>
    )
}

export default Controls
