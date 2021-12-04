import React from 'react'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
// @ts-ignore
import ButtonGroup from 'core/components/ButtonGroup'
// @ts-ignore
import Button from 'core/components/Button'
import { allDimensionIds, DimensionId } from './types'

export const Switcher = ({
    setDimension,
    dimension,
}: {
    setDimension: (dimension: DimensionId) => void
    dimension: DimensionId
}) => {
    const { translate } = useI18n()

    return (
        <ButtonGroup>
            {allDimensionIds.map((dimensionId) => (
                <Button
                    key={dimensionId}
                    size="small"
                    className={`Button--${dimension === dimensionId ? 'selected' : 'unselected'}`}
                    onClick={() => setDimension(dimensionId)}
                >
                    <span className="desktop">{translate(`ranges.selector.${dimensionId}`)}</span>
                    <span className="mobile">{translate(`ranges.selector.${dimensionId}`)[0]}</span>
                </Button>
            ))}
        </ButtonGroup>
    )
}
