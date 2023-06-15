import React, { memo } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import { color, spacing, fontSize } from 'core/theme'

const BlockCompletionIndicator = ({ completion, variant = 'pink' }) => {
    const { translate } = useI18n()
    const colorName1 = variant === 'pink' ? 'link' : 'text'
    const colorName2 = variant === 'pink' ? 'link' : 'textAlt'
    return (
        <Container className="CompletionIndicator" tabIndex={0}>
            <Tooltip className="CompletionIndicator__Tooltip" colorName={colorName1}>
                {translate('general.completion_percentage')}{' '}
                <strong>{completion.percentage}%</strong>{' '}
                {completion.count && <span>({completion.count})</span>}
            </Tooltip>
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
        </Container>
    )
}

BlockCompletionIndicator.propTypes = {
    completion: PropTypes.shape({
        count: PropTypes.number,
        percentage: PropTypes.number.isRequired
    }).isRequired
}

const Tooltip = styled.div`
    left: 50%;
    position: absolute;
    padding: 4px 8px;
    white-space: nowrap;
    transform: translate(-50%, -130%);
    opacity: 0;
    font-size: ${fontSize('small')};
    border-radius: 3px;
    transition: all 200ms ease-in;
    pointer-events: none;
    background: ${({ colorName }) => color(colorName)};
    color: ${color('background')};

    &:after {
        bottom: -15px;
        left: 50%;
        content: ' ';
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
        margin-left: -8px;
        border: 8px solid rgba(136, 183, 213, 0);
        border-top-color: ${({ colorName }) => color(colorName)};
    }
`

const Container = styled.div`
    margin-left: ${spacing(0.5)};
    position: relative;
    padding: 2px;

    &:focus {
        outline: 5px auto -webkit-focus-ring-color;
    }

    &:hover ${Tooltip}, &:focus ${Tooltip} {
        opacity: 1;
        transform: translate(-50%, -140%);
        transition: all 200ms ease-in;
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
