import React from 'react'
import styled, { css } from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
// import Cell from './Cell'
import { GAP } from './constants'
import { Total, AxisType } from './types'

const Totals = ({ axis, totals }: { axis: AxisType; totals: Total[] }) => {
    return (
        <Totals_ axis={axis} count={totals.length}>
            {totals.map(({ count: total }, i) => (
                <TotalItem key={i} total={total} />
            ))}
        </Totals_>
    )
}

const TotalItem = ({ total }: { total: number }) => <TotalsItem_>{total}</TotalsItem_>

const Totals_ = styled.div<{ axis: AxisType; count: number }>`
    position: absolute;
    display: grid;
    font-size: 10px;
    ${({ axis, count }) =>
        axis === 'x'
            ? css`
                  width: 100%;
                  color: red;
                  /* grid-template-columns: repeat(${count}, 1fr); */
                  grid-auto-columns: minmax(0, 1fr);
                  grid-auto-flow: column;
                  grid-column-gap: ${GAP}px;
                  bottom: -50px;
                  left: 0;
              `
            : css`
                  color: green;
                  /* grid-template-rows: repeat(${count}, 1fr); */
                  grid-auto-rows: minmax(0, 1fr);
                  grid-auto-flow: row;
                  grid-row-gap: ${GAP}px;
                  top: 0;
                  bottom: 0;
                  left: -50px;
              `};
`

const TotalsItem_ = styled.div`
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    background: rgba(255, 255, 255, 0.1);
    padding: 10px;
`

export default Totals
