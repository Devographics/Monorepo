import styled from 'styled-components'
import { staticProps } from './config'

export const ChartContainer = styled.div`
    display: flex;
    align-items: stretch;
    height: 180px;
`

export const ToolLegendContainer = styled.div`
    flex-grow: 0;
    flex-shrink: 0;
    width: 20px;
    margin-top: ${staticProps.margin.top}px;
    margin-bottom: ${staticProps.margin.bottom}px;
    display: flex;
    align-items: center;
    justify-content: center;
`

export const ToolLegend = styled.div`
    height: 20px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    color: ${({ theme }) => theme.colors.text};
    transform: rotate(-90deg);
    font-size: ${({ theme }) => theme.typography.size.smaller};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
`