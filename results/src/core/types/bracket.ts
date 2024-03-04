// import { Facet, FacetCompletion, Entity} from './data'

import { Entity, FacetCompletion } from "@devographics/types"
import { Facet } from "./data"

export interface BracketBucketRound {
  count: number
  percentage: number
}

export interface BracketBucketItem {
  id: number | string
  count: number

  combined: BracketBucketRound
  round1: BracketBucketRound
  round2: BracketBucketRound
  round3: BracketBucketRound

  color: string

  entity?: Entity
}

export interface BracketFacetItem {
  type: Facet
  id: number | string
  buckets: BracketBucketItem[]
  entity?: Entity// Entity
  completion: FacetCompletion
}