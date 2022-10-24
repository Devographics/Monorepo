// import React from 'react'
// import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// // import T from 'core/i18n/T'

// // const increment = 8
// const increment = 10
// const getDotCoordinates = (rowIndex, cellIndex, dotIndex) => {
//     const moduloTen = dotIndex % 10
//     const x = cellIndex * (increment + 1) * 10 + moduloTen * increment
//     const y = rowIndex * (increment + 1) * 10 + Math.floor(dotIndex / increment) * increment
//     console.log(rowIndex)
//     console.log(cellIndex)
//     console.log(dotIndex)
//     console.log(moduloTen)
//     return { x, y }
// }

// const Cell = ({ cellId, id, percentage_facet, entity, rowIndex, cellIndex }) => {
//     const dots = [...Array(Math.floor(percentage_facet))]
//     return (
//         <>
//             {dots.map((d, i) => {
//                 const { x, y } = getDotCoordinates(rowIndex, cellIndex, i)
//                 return <Dot key={`${cellId}.${i}`} x={x} y={y} >{i}</Dot>
//             })}
//         </>
//     )
// }

// const Cell_ = styled.div`
//     @media ${mq.large} {
//         max-width: 700px;
//         margin: 0 auto;
//         margin-bottom: ${spacing(4)};
//     }
// `

// const Dot = styled.div`
//     border-radius: 100%;
//     background: rgba(255, 255, 255, 0.5);
//     color: white;
//     color: rgba(255, 255, 255, 0);
//     height: 6px;
//     width: 6px;
//     margin-right: 2px;
//     margin-bottom: 2px;
//     position: absolute;
//     left: ${({ x }) => `${x}px`};
//     top: ${({ y }) => `${y}px`};
// `
// export default Cell
