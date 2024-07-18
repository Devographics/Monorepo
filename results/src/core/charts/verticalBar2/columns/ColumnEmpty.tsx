import { EmptyColumnProps } from '../types'
import React from 'react'
import { ColumnWrapper } from './ColumnWrapper'

export const ColumnEmpty = (props: EmptyColumnProps) => {
    return <ColumnWrapper {...props} />
}
