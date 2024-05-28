import './Row.scss'
import React, { useState } from 'react'
import { RowCommonProps, RowComponent } from '../common2/types'
import { RowDataProps } from '../horizontalBar2/types'

export const BAR_HEIGHT = 25

export const Column = (props: { rowComponent: RowComponent } & RowDataProps & RowCommonProps) => {
    const { columnComponent } = props
    const ColumnComponent = columnComponent
    const rowComponentProps = props
    return <ColumnComponent {...rowComponentProps} />
}
