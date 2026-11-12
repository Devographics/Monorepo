import React, { memo } from 'react'
import styled from 'styled-components'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'

const BlockCompletionIndicator = ({
    completion,
    variant = 'pink'
}: {
    completion: { count?: number; percentage: number }
    variant: 'grey' | 'pink' | string
}) => {
    const { translate } = useI18n()
    const color = variant === 'pink' ? 'var(--primaryColor)' : 'var(--textAltColor)'
    return (
        <Container className="CompletionIndicator">
            <Tooltip
                trigger={
                    <span>
                        <div className="CompletionIndicator__Data sr-only">
                            {translate('general.completion_percentage')}{' '}
                            <strong>{completion.percentage}%</strong>{' '}
                            {completion.count && <span>({completion.count})</span>}
                        </div>
                        <Chart height="16" width="16" viewBox="0 0 20 20">
                            <ChartBackground r="10" cx="10" cy="10" $color={color} />
                            <ChartForeground
                                $color={color}
                                r="5"
                                cx="10"
                                cy="10"
                                fill="transparent"
                                strokeWidth="10"
                                strokeDasharray={`calc(${completion.percentage} * 31.4px / 100) 31.4px`}
                                transform="rotate(-90) translate(-20)"
                            />
                        </Chart>
                    </span>
                }
                contents={
                    <span>
                        {translate('general.completion_percentage')}{' '}
                        <strong>{completion.percentage}%</strong>{' '}
                        {completion.count && <span>({completion.count})</span>}
                    </span>
                }
            />
        </Container>
    )
}

const Container = styled.div`
    margin-left: var(--halfSpacing);
    position: relative;
    padding: 2px;

    &:focus {
        outline: 5px auto -webkit-focus-ring-color;
    }
`

const Chart = styled.svg`
    display: block;
`

const ChartBackground = styled.circle<{ $color: string }>`
    fill: ${({ $color }) => $color};
    opacity: 0.5;
`

const ChartForeground = styled.circle<{ $color: string }>`
    stroke: ${({ $color }) => $color};
`

export default memo(BlockCompletionIndicator)
