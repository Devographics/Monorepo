import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'

interface LogoProps {
    className?: string
    animated?: boolean
    size?: string
    showText?: boolean
}

export const Logo = ({ className, animated = true, showText = true, size = 'l' }: LogoProps) => (
    <Wrapper>
        <img src={`/images/logo/css2021_logo_transparent.png`} alt="State of CSS 2021" />
    </Wrapper>
)

const Wrapper = styled.div`
    margin: 0 auto;
    margin-bottom: ${spacing(3)};
    max-width: 400px;
    width: 100%;
    img {
        display: block;
        width: 100%;
    }
`
export default Logo
