import React, { memo, PropsWithChildren, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import './ChartContainer.scss'

export interface IndicatorProps {
    position: 'top' | 'right' | 'bottom' | 'left'
}

export interface ChartContainerProps {
    height?: number
    fit?: boolean
    minWidth?: number
    className?: string
    vscroll?: boolean
}

const Indicator = ({ position }: IndicatorProps) => (
    <span className={`chart-container-indicator chart-container-indicator-${position}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="100" viewBox="0 0 30 100">
            <g id="Outline_Icons">
                <line
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="8"
                    x1="30"
                    y1="0"
                    x2="0"
                    y2="50"
                />
                <line
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="8"
                    x1="0"
                    y1="50"
                    x2="30"
                    y2="100"
                />
            </g>
        </svg>
    </span>
)
const MemoIndicator = memo(Indicator)

/**
 * - Fit: fit to viewport width
 * - Expand: force a 600px or props width
 */
const ChartContainer = (props: PropsWithChildren<ChartContainerProps>) => {
    const {
        children,
        height,
        minWidth = 400,
        fit = false,
        className = '',
        vscroll = false,
        ...otherProps
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState<number | undefined>()

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth)
        }
    }, []) // The empty dependency array makes sure this runs only once after component mount

    return (
        <div className={`chart-container-outer ${className}`} style={{ height }} ref={containerRef}>
            <div className="chart-container" style={{ height }}>
                <div
                    className={`chart-container-inner ${
                        !fit ? ' chart-container-inner-expand' : ''
                    }`}
                    style={{ height, minWidth: fit ? '' : minWidth }}
                >
                    {React.cloneElement(children, { ...otherProps, containerWidth })}
                </div>
            </div>
            {!fit && (
                <>
                    <MemoIndicator position="left" />
                    <MemoIndicator position="right" />
                    {vscroll && (
                        <>
                            <MemoIndicator position="top" />
                            <MemoIndicator position="bottom" />
                        </>
                    )}
                </>
            )}
        </div>
    )
}

ChartContainer.propTypes = {
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    fit: PropTypes.bool,
    className: PropTypes.string,
    vscroll: PropTypes.bool
}
export default ChartContainer
