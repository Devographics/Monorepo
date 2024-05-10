import React, { memo } from 'react'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { BucketUnits } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'

const UnitButton = ({ units, current, onChange, i18nNamespace = 'chart_units', chartFilters }) => {
    const { getString } = useI18n()

    const values = {} as { axis: string }
    if ([BucketUnits.AVERAGE, BucketUnits.MEDIAN, BucketUnits.PERCENTILES].includes(units)) {
        const s = getString(`${chartFilters.facet.sectionId}.${chartFilters.facet.id}`)
        if (s?.t) {
            values.axis = s.t
        }
    }

    const key = `${i18nNamespace}.${units}`

    return (
        <Button
            size="small"
            className={`Button--${current === units ? 'selected' : 'unselected'}`}
            onClick={() => onChange(units)}
            aria-pressed={current === units}
        >
            <T k={key} values={values} />
        </Button>
    )
}

const BlockUnitsSelector = ({
    units,
    onChange,
    options = [BucketUnits.PERCENTAGE_SURVEY, BucketUnits.PERCENTAGE_QUESTION, BucketUnits.COUNT],
    i18nNamespace,
    chartFilters
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
                    chartFilters={chartFilters}
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
