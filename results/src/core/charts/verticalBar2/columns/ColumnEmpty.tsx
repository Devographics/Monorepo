import { BasicPointData, EmptyColumnProps } from '../types'
import React from 'react'
import { ColumnWrapper } from './ColumnWrapper'

export const ColumnEmpty = <PointData extends BasicPointData>(
    props: EmptyColumnProps<PointData>
) => {
    return <ColumnWrapper {...props} />
}
