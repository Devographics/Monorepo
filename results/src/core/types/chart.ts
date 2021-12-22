import { BlockMode, BlockUnits, BlockLegend } from './block'
import { Entity } from './data'

export type ColorVariant = 'primary' | 'secondary'
export interface ChartComponentProps {
    viewportWidth?: number
    className?: string
    bucketKeys?: BlockLegend[]
    total?: number
    i18nNamespace: string
    translateData?: boolean
    mode: BlockMode
    units: BlockUnits
    chartProps?: any
    colorVariant?: ColorVariant
    // 'buckets' is declared by chart
}

export interface TickItemProps {
    x: number
    y: number
    id?: string | number
    value?: string | number
    shouldTranslate: boolean
    i18nNamespace: string
    entity: Entity
    tickRotation?: number
    description?: string
}
