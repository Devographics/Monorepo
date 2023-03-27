import React, { FC } from 'react'
import { PageContextValue } from '@types/context'
import { ResponsesParameters } from '@devographics/types'

export type BlockUnits =
    | 'count'
    | 'percentageSurvey'
    | 'percentageQuestion'
    | 'percentageFacet'
    | 'percentageBucket'
    | 'average'
export type BlockRatioUnits =
    | 'satisfaction_percentage'
    | 'interest_percentage'
    | 'awareness_percentage'
    | 'usage_percentage'
export type BlockSetUnits = React.Dispatch<React.SetStateAction<string>>
export type BlockMode = 'absolute' | 'relative'

export interface BlockComponentProps {
    block: BlockDefinition
    keys?: string[]
    context: PageContextValue
    // 'data' property is defined by each specific block
}

export interface BlockDefinition {
    parameters: ResponsesParameters
    id: string
    template?: string
    blockType?: string
    tabId?: string
    titleId?: string
    blockName?: string
    filters?: FilterType[]

    // config
    mode?: BlockMode
    blockNamespace?: string
    chartNamespace?: string
    colorVariant?: string
    overrides?: object

    // data
    query?: string
    variables?: any
    dataPath?: string
    keysPath?: string
    entityPath?: string
    defaultUnits?: BlockUnits

    // booleans
    legendPosition?: 'bottom' | 'top'
    translateData?: boolean
    hasSponsor?: boolean
}

type FilterType = 'filters' | 'facets'

export interface BlockVariantProps {
    id?: string
    className?: string
    units?: BlockUnits
    setUnits?: BlockSetUnits
    unitsOptions?: BlockUnits[] | string[]
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

// export type GetChartDataFunction =
