import React, { memo } from 'react'
import PropTypes from 'prop-types'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'

const UnitButton = ({ units, current, onChange }) => (
    <Button
        size="small"
        className={`Button--${current === units ? 'selected' : 'unselected'}`}
        onClick={() => onChange(units)}
        aria-pressed={current === units}
    >
        <T k={`chart_units.${units}`} />
    </Button>
)

const BlockUnitsSelector = ({ units, onChange }) => {
    return (
        <ButtonGroup>
            <UnitButton units="percentage_question" current={units} onChange={onChange} />
            <UnitButton units="percentage_survey" current={units} onChange={onChange} />
            <UnitButton units="count" current={units} onChange={onChange} />
        </ButtonGroup>
    )
}

BlockUnitsSelector.propTypes = {
    units: PropTypes.oneOf(['percentage', 'count', 'percentage_survey']).isRequired,
    onChange: PropTypes.func.isRequired,
}

export default memo(BlockUnitsSelector)
