import React from 'react'
import styled, { css } from 'styled-components'
import {
    layerCount,
    CityscapeToolData,
    CityscapeLayerData,
    CityscapeCategoryData,
} from './ToolsCityscapeBlock'
// @ts-ignore
import { spacing, mq, fontSize } from 'core/theme'
import random from 'lodash/random'
// import { SectionItem } from './SectionItem'
import { darken, transparentize } from 'polished'

export const ToolsCityscapeChart = ({ data }: { data: CityscapeCategoryData[] }) => {
    return (
        <Container>
            {data.map((category) => (
                <ToolCategory {...category} key={category.id} />
            ))}
        </Container>
    )
}

const Container = styled.div`
    height: 600px;
    border-bottom: 5px solid #ffffff33;
    padding: 0 60px;
    display: flex;
    overflow: hidden;
`

const ToolCategory = ({ id, layers }: CityscapeCategoryData) => (
    <Category>
        {id}
        {layers.map((layer) => (
            <ToolLayer {...layer} key={layer.layer} />
        ))}
    </Category>
)
const Category = styled.div`
    position: relative;
    flex: 1;
    
`
const ToolLayer = ({ layer, items }: CityscapeLayerData) => (
    <Layer layer={layer}>
        {items.map((tool, i) => (
            <ToolItem layer={layer} tool={tool} x={i} key={tool.id} />
        ))}
    </Layer>
)

const Layer = styled.div`
    position: absolute;
    bottom: 0;
    width: 100%;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    /* overflow: hidden; */
    ${({ layer }) => css`
        z-index: ${layerCount - layer};
    `}
`

const ToolItem = ({ layer, tool, x }: { layer: number; tool: CityscapeToolData; x: number }) => (
    <ToolBar {...tool} layer={layer} x={x}>
        <ToolLabel>{tool.entity.name}</ToolLabel>
    </ToolBar>
)




const minBuildingWidth = 50
const minBuildingHeight = 100
const horizontalOffset = 10

const getOpacity = (layer: number) => layer / 8
const getDarkness = (layer: number) => layer / 8

const ToolBar = styled.div`
    ${({ x, layer = 0, color, usage }: CityscapeToolData) => css`
        /* position: absolute; */
        /* left: ${random(0, 10) + x * 70}px; */
        /* bottom: 0px; */
        height: ${minBuildingHeight + Math.round(usage / 50)}px;
        width: ${minBuildingWidth + random(0, 20)}px;
        transform: translateX(${horizontalOffset / 2 - random(0, horizontalOffset)}px);
        /* background: linear-gradient(
            ${transparentize(getOpacity(layer), color)},
            ${transparentize(getOpacity(layer), darken(0.3, color))}
        ); */
        /* background: ${transparentize(getOpacity(layer), color)}; */
        background: ${darken(getDarkness(layer), color)};
    `}
    margin-right: 5px;

    box-shadow: 3px 3px 2px rgba(0,0,0,0.4);
    overflow: hidden;
    position: relative;
`

const ToolLabel = styled.div`
    transform-origin: center left;
    transform: rotate(90deg);
    text-align: right;
    font-size: ${fontSize('small')};
    text-shadow: 1px 1px 2px #000000aa;
    font-weight: bold;
    /* background: #00000066;
    padding: 5px; */
    position: absolute;
    left: 50%;
`
