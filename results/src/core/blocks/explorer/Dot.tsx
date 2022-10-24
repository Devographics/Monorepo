// import React from 'react'
// import styled from 'styled-components'

// const increment = 10


// // get data attr for debugging
// const getDataAttr = (o: any) => {
//     const attr: any = {}
//     Object.keys(o).forEach(k => {
//         attr[`data-${k}`] = o[k]
//     })
//     return attr
// }

// const Dot = ({ facets, keys1, keys2, globalIndex }) => {
//     const gridCoords = getGridCoordinates({ facets, keys1, keys2, globalIndex })
//     const pixelCoords = getPixelCoordinates(gridCoords)
//     const dataAttr = getDataAttr({ globalIndex, ...gridCoords, ...pixelCoords })
//     return (
//         <Dot_ {...pixelCoords} {...dataAttr}>
//             {globalIndex}
//         </Dot_>
//     )
// }

// const Dot_ = styled.div`
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
// export default Dot
