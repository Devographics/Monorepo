import React, { ReactNode } from 'react'
import { ChartState, Control } from '../horizontalBar2/types'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { useI18n } from '@devographics/react-i18n'

export const Controls = ({
    controls,
    chartState
}: {
    controls: Control[]
    chartState: ChartState
}) => {
    const { facet } = chartState
    const { getString } = useI18n()
    const axisLabel = facet && getString(`${facet.sectionId}.${facet.id}`)?.t
    return (
        <div className="chart-controls">
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
                            onClick={onClick}
                            aria-pressed={isChecked}
                        >
                            <IconComponent />
                            <T k={labelId} values={{ axis: axisLabel }} />
                        </Button>
                    )
                })}
            </ButtonGroup>
        </div>
    )
}

export default Controls
