import React from 'react'
import styled, { css } from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
// import Cell from './Cell'
import { GAP } from './constants'
import { Key, AxisType } from './types'

const Axis = ({ axis, keys }: { axis: AxisType; keys: Key[] }) => {
    return (
        <Axis_ axis={axis} count={keys.length}>
            {keys.map((key: string) => (
                <AxisItem key={key} id={key} />
            ))}
        </Axis_>
    )
}

const AxisItem = ({ id }: { id: string }) => <AxisItem_>{id}</AxisItem_>

const Axis_ = styled.div<{ axis: AxisType; count: number }>`
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
                  bottom: 0;
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
                  left: -100px;
              `};
`

const AxisItem_ = styled.div`
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
`

export default Axis
