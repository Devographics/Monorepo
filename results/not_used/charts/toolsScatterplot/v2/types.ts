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
    categoryId: string
    x: number
    xValue: number
    formattedX: string
    y: number
    yValue: number
    formattedY: string
    id: string
    label: string
    color: string
    category: SectionMetadata
    isCurrentItem: boolean
    isHighlighted: boolean
}
