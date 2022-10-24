import React from 'react'
import styled, { css } from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
// import Cell from './Cell'
import { GAP } from './constants'
import { Key } from './types'

const Axis = ({ type, keys }) => {
    return (
        <Axis_ type={type} count={keys.length}>
            {keys.map((key: string) => (
                <AxisItem key={key} id={key} />
            ))}
        </Axis_>
    )
}

const AxisItem = ({ id }) => <AxisItem_>{id}</AxisItem_>

const Axis_ = styled.div`
    position: absolute;
    display: grid;
    font-size: 10px;
    ${({ type, count }) =>
        type === 'x'
            ? css`
                  color: red;
                  grid-template-columns: repeat(${count}, 1fr);
                  grid-column-gap: ${GAP}px;
                  bottom: 0;
                  left: 0;
              `
            : css`
                  color: green;
                  grid-template-rows: repeat(${count}, 1fr);
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
