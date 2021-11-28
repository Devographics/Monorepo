import React from 'react'

interface LogoProps {
    className?: string
    animated?: boolean
    size?: string
    showText?: boolean
}

export const Logo = ({ className, animated = true, showText = true, size = 'l' }: LogoProps) => (
    <div>
        <img src={`/images/tshirt/stateofcss2021_logo.png`} alt="State of CSS 2021" />
    </div>
)

export default Logo
