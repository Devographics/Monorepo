import React, { memo } from 'react'
import styled from 'styled-components'
import { useI18n } from '@devographics/react-i18n'
import { color, spacing, fontSize } from 'core/theme'
import Tooltip from 'core/components/Tooltip'

const BlockCompletionIndicator = ({
    completion,
    variant = 'pink'
}: {
    completion: { count?: number; percentage: number }
    variant: 'grey' | 'pink' | string
}) => {
    const { translate } = useI18n()
    const colorName1 = variant === 'pink' ? 'link' : 'text'
    const colorName2 = variant === 'pink' ? 'link' : 'textAlt'
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
                            <ChartBackground r="10" cx="10" cy="10" colorName={colorName2} />
                            <ChartForeground
                                colorName={colorName2}
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
    margin-left: ${spacing(0.5)};
    position: relative;
    padding: 2px;

    &:focus {
        outline: 5px auto -webkit-focus-ring-color;
    }
`

const Chart = styled.svg`
    display: block;
`

const ChartBackground = styled.circle`
    fill: ${({ colorName }) => color(colorName)};
    opacity: 0.5;
`

const ChartForeground = styled.circle`
    stroke: ${({ colorName }) => color(colorName)};
`

export default memo(BlockCompletionIndicator)
