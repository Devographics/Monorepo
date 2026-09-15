import { SectionMetadata } from '@devographics/types'

export type QuadrantScale = {
    type: string
    min: number
    max: number
}

export type NodeData = {
    index: number
    serieIndex: number
    serieId: string
    xValue: number
    formattedX: string
    yValue: number
    formattedY: string
    id: string
    label: string
    color: string
    isCurrentItem: boolean
    isHighlighted: boolean
    categoryId?: string
    category?: SectionMetadata
}

export type NodeDataWithCoordinates = NodeData & {
    x: number
    y: number
}
