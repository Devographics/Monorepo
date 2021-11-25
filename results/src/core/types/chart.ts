import { BlockMode, BlockUnits, BlockLegend } from './block'

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
  colorVariant?: string,
  // 'buckets' is declared by chart
}