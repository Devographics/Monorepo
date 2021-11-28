import React from 'react'

interface LogoProps {
    className?: string
    animated?: boolean
    size?: string
    showText?: boolean
}

export const Logo = ({ className, animated = true, showText = true, size = 'l' }: LogoProps) => (
    <div aria-hidden="true" className={`Logo__Container Logo--${size} ${className || ''}`}>
        <div className={`Logo ${animated ? 'Logo--animated' : ''}`}>
            <SVGFilter />
            <div className="triangle">
                <div className="inner" />
            </div>
            <div className="blobs">
                <div className="blob blob1" />
                <div className="blob blob2" />
            </div>
            {size !== 's' && (
                <>
                    <div className="stripe stripe1" />
                    <div className="stripe stripe2" />
                    <div className="stripe stripe3" />
                    <div className="stripe stripe4" />
                </>
            )}
            <div className="circle">
                <div className="inner">
                    <div />
                </div>
            </div>

            <div className="frame">
                <div className="inner">
                    <div />
                </div>
            </div>
            {size !== 's' && (
                <>
                    <div className="tilde tilde1">~</div>
                    <div className="tilde tilde2">~</div>
                    <div className="tilde tilde3">~</div>
                </>
            )}
            {showText && <div className="text stateof">State Of</div>}
            <div className="letter c">
                <div>C</div>
            </div>
            <div className="letter s1">
                <div>S</div>
            </div>
            <div className="letter s2">
                <div>S</div>
            </div>
            {showText && <div className="text year">2020</div>}
        </div>
    </div>
)

const SVGFilter = () => (
    <svg xmlns="http://www.w3.org/2000/svg">
        {/* see https://css-tricks.com/gooey-effect/ */}
        <defs>
            <filter id="blob">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                <feColorMatrix
                    in="blur"
                    values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7"
                    result="goo"
                />
                <feBlend in="SourceGraphic" in2="goo" />
            </filter>
        </defs>
    </svg>
)

export default Logo