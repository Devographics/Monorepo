import React from 'react'
import { ChartStateWithNestedToggle, CommonProps, NestedEnum } from '../common2/types'
import Toggle from './Toggle'
import { useI18n } from '@devographics/react-i18n'

export const ChartNestedToggle = (props: CommonProps<ChartStateWithNestedToggle>) => {
    const { chartState } = props
    const { getString } = useI18n()
    const { nested, setNested } = chartState
    return (
        <div className="chart-nested-toggle">
            <Toggle
                labelId="charts.nested_toggle"
                items={[
                    {
                        label: getString('charts.nested_toggle.nested')?.t,
                        id: NestedEnum.NESTED,
                        isEnabled: nested === NestedEnum.NESTED
                    },
                    {
                        label: getString('charts.nested_toggle.flat')?.t,
                        id: NestedEnum.FLAT,
                        isEnabled: nested === NestedEnum.FLAT
                    }
                ]}
                handleSelect={id => {
                    setNested(id as NestedEnum)
                }}
            />
        </div>
    )
}
export default ChartNestedToggle
