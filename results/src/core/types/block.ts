import React, { FC } from 'react';

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
  template: string
  blockType: string

  // config
  mode: BlockMode
  i18nNamespace: string
  colorVariant: string
  overrides: object

  // data
  query: string
  variables: object
  dataPath: string
  keysPath: string
  defaultUnits: BlockUnits

  // booleans
  showDescription: boolean
  showLegend: boolean
  legendPosition: 'bottom' | 'top'
  showTitle: boolean
  showNote: boolean
  translateData: boolean

}

export interface BlockVariantProps {
  id: string
  className: string
  children: FC,
  units: BlockUnits
  setUnits: BlockSetUnits
  // error,
  // data,
  // block = {},
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