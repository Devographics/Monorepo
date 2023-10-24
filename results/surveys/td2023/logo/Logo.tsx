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
        <img
            src="https://assets.surveys.tokyodev.com/images/surveys/td2023.png"
            alt="TokyoDev Developer Survey 2023"
        />
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
