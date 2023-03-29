import React, { memo } from 'react'
import PropTypes from 'prop-types'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { ChartModes } from '../filters/types'
import { BucketUnits } from '@devographics/types'

const UnitButton = ({ units, current, onChange, i18nNamespace = 'chart_units' }) => (
    <Button
        size="small"
        className={`Button--${current === units ? 'selected' : 'unselected'}`}
        onClick={() => onChange(units)}
        aria-pressed={current === units}
    >
        <T k={`${i18nNamespace}.${units}`} />
    </Button>
)

const BlockUnitsSelector = ({
    units,
    onChange,
    options = [BucketUnits.PERCENTAGE_SURVEY, BucketUnits.PERCENTAGE_QUESTION, BucketUnits.COUNT],
    i18nNamespace
}) => {
    return (
        <ButtonGroup>
            {options.map(option => (
                <UnitButton
                    key={option}
                    units={option}
                    current={units}
                    onChange={onChange}
                    i18nNamespace={i18nNamespace}
                />
            ))}
        </ButtonGroup>
    )
}

// BlockUnitsSelector.propTypes = {
//     units: PropTypes.oneOf(['percentage', 'count', 'percentageSurvey']).isRequired,
//     onChange: PropTypes.func.isRequired
// }

export default memo(BlockUnitsSelector)
