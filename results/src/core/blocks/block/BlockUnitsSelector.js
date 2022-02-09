import React, { memo } from 'react'
import PropTypes from 'prop-types'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'

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

const defaultOptions = ['percentage_survey', 'percentage_question', 'count']

const BlockUnitsSelector = ({ units, onChange, options = defaultOptions, i18nNamespace }) => {
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
//     units: PropTypes.oneOf(['percentage', 'count', 'percentage_survey']).isRequired,
//     onChange: PropTypes.func.isRequired
// }

export default memo(BlockUnitsSelector)
