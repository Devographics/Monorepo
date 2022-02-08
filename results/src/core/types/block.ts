import React, { FC } from 'react'

export type BlockUnits = 'count' | 'percentage_survey' | 'percentage_question' | 'percentage_facet'
export type BlockSetUnits = React.Dispatch<React.SetStateAction<string>>
export type BlockMode = 'absolute' | 'relative'

export interface BlockComponentProps {
    block: BlockDefinition
    keys?: string[]
    // 'data' property is defined by each specific block
}

export interface BlockDefinition {
    id: string
    template?: string
    blockType?: string
    tabId?: string
    titleId?: string
    blockName?: string

    // config
    mode?: BlockMode
    blockNamespace?: string
    chartNamespace?: string
    colorVariant?: string
    overrides?: object

    // data
    query?: string
    variables?: object
    dataPath?: string
    keysPath?: string
    entityPath?: string
    defaultUnits?: BlockUnits

    // booleans
    legendPosition?: 'bottom' | 'top'
    translateData?: boolean
}

export interface BlockVariantProps {
    id: string
    className: string
    units: BlockUnits
    setUnits: BlockSetUnits
    block: BlockDefinition
    // error,
    // data,
    // legendProps,
    // titleProps,
    // headings,
    // tables,
}

export interface BlockLegend {
    id: string
    label: string
    shortLabel?: string
    color?: string
}
