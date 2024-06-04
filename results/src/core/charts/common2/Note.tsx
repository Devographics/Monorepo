import './Note.scss'
import React from 'react'

export const Note = ({ children }: { children: JSX.Element | string }) => (
    <div className="chart-note">{children}</div>
)
