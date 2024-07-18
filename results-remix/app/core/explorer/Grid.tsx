import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
// import Dots from './Dots';
import InnerGrid from './InnerGrid'
import Axis from './Axis'
import { CommonProps } from './types'
import Corner from './Corner'
import { GRID_GAP } from './constants'

/*

xKeys: x-axis
yKeys: y-axis

*/

export interface GridProps extends CommonProps {
    showCellCountsOverride: boolean
    addModals: boolean
}

const Grid = (props: GridProps) => {
    const { xKeys, yKeys } = props
    return (
        <GridWrapper_>
            <Corner {...props} />
            <Axis axis="x" keys={xKeys} {...props} />
            <Axis axis="y" keys={yKeys} {...props} />
            <InnerGrid {...props} />
        </GridWrapper_>
    )
}

const GridWrapper_ = styled.div`
    height: 100%;
    display: grid;
    grid-template-rows: min-content 1fr;
    grid-template-columns: min-content 1fr;
    gap: ${GRID_GAP}px;
    grid-template-areas:
        'controls   xAxis'
        'yAxis      content';

    @media ${mq.small} {
        width: 700px;
        .details-grid & {
            width: auto;
        }
        /* grid-template-columns: minmax(min-content, 100px) 1fr; */
        grid-template-columns: 100px 1fr;
    }
`

export default Grid
