import React, { useId } from 'react'
import './Holographic.scss'

/*

Wrap any monochrome (currentColor) SVG to repaint it with an animated,
rotating spectrum gradient for a holographic/foil effect.

<Holographic applyTo="stroke">
    <SomeIcon />
</Holographic>

Note: gradients are sized to each shape's bounding box, so perfectly
horizontal or vertical lines (zero-height/width box) won't render.

*/

// Colors of the spectrum; the first color is repeated at the end for a seamless loop
const DEFAULT_COLORS = ['#ff8a8a', '#ffd88a', '#a6ff8a', '#8affe8', '#8ab4ff', '#d68aff']
// Seconds for the gradient to complete one full rotation
const DEFAULT_DURATION = 6

interface HolographicProps {
    children: React.ReactNode
    colors?: string[]
    duration?: number
    // which currentColor attributes to repaint
    applyTo?: 'stroke' | 'fill' | 'all'
}

export const Holographic = ({
    children,
    colors = DEFAULT_COLORS,
    duration = DEFAULT_DURATION,
    applyTo = 'all'
}: HolographicProps) => {
    // useId() returns ids like ":r1:", strip colons so they work inside url(#…)
    const gradientId = `holographic-${useId().replace(/:/g, '')}`
    const stops = [...colors, colors[0]]

    const style = { '--holographic-paint': `url(#${gradientId})` } as React.CSSProperties

    return (
        <span className={`holographic holographic-${applyTo}`} style={style}>
            <svg className="holographic-defs" aria-hidden="true">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0.5" x2="1" y2="0.5">
                        {stops.map((color, index) => (
                            <stop
                                key={index}
                                offset={index / (stops.length - 1)}
                                stopColor={color}
                            />
                        ))}
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur={`${duration}s`}
                            repeatCount="indefinite"
                        />
                    </linearGradient>
                </defs>
            </svg>
            {children}
        </span>
    )
}

export default Holographic
