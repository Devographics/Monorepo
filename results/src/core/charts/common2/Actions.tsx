import React from 'react'
import { Control } from '../horizontalBar2/types'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { useI18n } from '@devographics/react-i18n'

import { ShareIcon, DataIcon, FiltersIcon } from 'core/icons'
import { CommonProps } from './types'

const actions = [
    {
        id: 'customize',
        icon: FiltersIcon
    },
    {
        id: 'data',
        icon: DataIcon
    },
    {
        id: 'share',
        icon: ShareIcon
    }
]

export const Actions = ({ chartState }: CommonProps) => {
    const actionsItems: Control[] = actions.map(item => ({
        ...item,
        labelId: `charts.actions.${item.id}`,
        onClick: e => {
            e.preventDefault()
        }
    }))
    const { facet } = chartState
    const { getString } = useI18n()
    const axisLabel = facet && getString(`${facet.sectionId}.${facet.id}`)?.t
    return (
        <div className="chart-actions">
            <ButtonGroup>
                {actionsItems.map(action => {
                    const { id, labelId, onClick, icon } = action
                    const IconComponent = icon
                    return (
                        <Button
                            key={id}
                            size="small"
                            className={`chart-action-button`}
                            onClick={onClick}
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

export default Actions
