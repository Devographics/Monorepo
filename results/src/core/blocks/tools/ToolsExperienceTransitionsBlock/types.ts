import {
    SankeyNodeDatum as BaseSankeyNodeDatum,
    SankeyLinkDatum as BaseSankeyLinkDatum
} from '@nivo/sankey'
import { BlockContext } from 'core/blocks/types'
import { ToolExperienceId } from 'core/bucket_keys'

export type ToolsExperienceTransitionsBlockData = BlockContext<
    'tools_experience_transitions',
    'ToolsExperienceTransitionsBlock',
    never,
    never
>

export interface ApiToolExperienceTransitions {
    // tool ID
    id: string
    experienceTransitions: {
        nodes: any[]
        transitions: any[]
    }
}

export interface ChartNodeData {
    id: string
    year: number
    choice: ToolExperienceId
}

export interface ChartLinkData {
    source: string
    target: string
    value: number
    percentage: number
}

export type SankeyNodeDatum = BaseSankeyNodeDatum<ChartNodeData, ChartLinkData>

export type SankeyLinkDatum = BaseSankeyLinkDatum<ChartNodeData, ChartLinkData>

export type SankeyYear = {
    year: number
    x: number
}