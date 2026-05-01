import React from 'react'
import styled, { useTheme, css } from 'styled-components'
// import T from 'core/i18n/T'
// import Dot from './Dot'
import { DotType, UnitType } from './types'
import { CellProps } from './Cell'
import { GAP, DOT_RADIUS, DOT_GAP } from './constants'

interface DotsProps extends CellProps {
    cellData: any
}

// const getDotColor = ({ type }) => {
//   switch (type) {
//     case 'normal':
//       return 'rgba(255,255,255,0.5)';
//     case 'extra':
//       return '#38D6FE';
//       // return 'rgba(0,255,0,0.5)';
//       // console.log(color('link'));
//       // return color('link');
//     case 'missing':
//       return 'rgba(255,255,255,0.25)';
//   }
// };

const getDotStyle = (dot: DotType, extraColor) => {
    const { type } = dot
    switch (type) {
        case 'missing':
            return { border: `1px solid rgba(255,255,255,0.3)`, background: 'none' }
        case 'extra':
            // return { boxShadow: `0px 0px 4px 1px rgb(56 214 254 / 0.5)` };
            return { background: extraColor }
        default:
            return {}
    }
}

const Dots = (props: DotsProps) => {
    const { cellData, stateStuff } = props
    const { dotsPerLine, unit } = stateStuff
    const { dots } = cellData
    return (
        <DotsWrapper_>
            <Dots_ style={{ gridTemplateColumns: `repeat(${dotsPerLine}, 1fr)` }}>
                {dots.map((dot: DotType, i: number) => (
                    <Dot key={i} dot={dot} unit={unit} />
                ))}
            </Dots_>
        </DotsWrapper_>
    )
}

interface DotProps {
    dot: DotType
    unit: UnitType
}

export const Dot = ({ dot, unit }: DotProps) => {
    const theme = useTheme()
    return (
        <Dot_ unit={unit}>
            <div style={getDotStyle(dot, theme.colors.link)} />
        </Dot_>
    )
}

// const DotsRow = ({ dots, rowIndex }) => {
//   const rowDots = dots.slice(rowIndex * MAX_DOT_PER_CELL_LINE, (rowIndex + 1) * MAX_DOT_PER_CELL_LINE);
//   return (
//     <DotsRow_>
//       {rowDots.map((dot, i) => (
//         <Dot_ {...getDataAttr(dot)} key={i} style={getDotStyle(dot)} />
//       ))}
//     </DotsRow_>
//   );
// };

const DotsWrapper_ = styled.div`
    position: relative;
`

const Dots_ = styled.div`
    /* position: absolute; */
    /* left: 0px; */
    /* top: 0px; */
    /* bottom: 0px; */
    /* right: 0px; */
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    /* grid-template-rows: repeat(10, 1fr); */
    /* column-gap: 10px; */
    row-gap: ${DOT_GAP}px;
    /* pointer-events: none; */
    /* display: flex;
  flex-direction: column;
  gap: ${GAP}; */
`

// const DotsRow_ = styled.div`
//   display: flex;
//   justify-content: space-between;
// `;

const Dot_ = styled.div<{ unit: string }>`
    display: grid;
    place-items: center;
    /* margin-right: 2px; */
    /* margin-bottom: 2px; */
    /* position: absolute; */
    /* z-index: 5; */
    /* transition: all 700ms ease-in; */
    div {
        background: rgba(255, 255, 255, 0.5);
        height: ${DOT_RADIUS}px;
        width: ${DOT_RADIUS}px;
        ${({ unit }) =>
            unit === 'count' &&
            css`
                border-radius: 100%;
            `}
    }
`

export default Dots
