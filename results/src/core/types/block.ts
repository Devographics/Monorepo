import React, { ReactNode } from 'react'
import { ColorVariant, ResultsByYear, YearCompletion } from '.'

export type BlockUnits = 'count' | 'percentage_survey' | 'percentage_question' | 'percentage_facet'
export type BlockSetUnits = React.Dispatch<React.SetStateAction<BlockUnits>>
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

    // config
    mode?: BlockMode
    blockNamespace?: string
    chartNamespace?: string
    colorVariant?: ColorVariant
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
    id?: string
    className?: string
    children: ReactNode
    units: BlockUnits
    setUnits: BlockSetUnits
    block: BlockDefinition
    completion: YearCompletion
    data: ResultsByYear
    // tables have the type of TableData but as it is being returned form a fn I'm unsure on how to do this in TS
    tables: unknown
    legendProps: unknown // is this used at all?
    // error,
    // titleProps,
    // headings,
}

export interface BlockLegend {
    id: string
    label: string
    shortLabel?: string
    color?: string
}
