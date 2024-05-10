export interface PointDatum {
    index: string
    count: number
    percentage: number
    percentageDelta: number
}

export interface ComputedPoint {
    x: number
    y: number
    data: PointDatum
}

export interface Datum {
    id: string
    name: string
    baseline: number
    data: PointDatum[]
}

export interface ComputedDatum {
    id: string
    index: number
    name: string
    baseline: number
    color: string
    data: ComputedPoint[]
}
