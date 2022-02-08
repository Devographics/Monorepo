import {
    SankeyNodeDatum as BaseSankeyNodeDatum,
    SankeyLinkDatum as BaseSankeyLinkDatum
} from '@nivo/sankey'
import { BlockContext } from 'core/blocks/types'

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
    choice: string
}

export interface ChartLinkData {
    source: string
    target: string
    value: number
    percentage: number
}

export type SankeyNodeDatum = BaseSankeyNodeDatum<ChartNodeData, ChartLinkData>

export type SankeyLinkDatum = BaseSankeyLinkDatum<ChartNodeData, ChartLinkData>
