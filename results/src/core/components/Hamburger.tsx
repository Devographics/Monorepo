import React from 'react'
import styled from 'styled-components'
import { color } from 'core/theme'

const Hamburger = () => (
    <Container xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <g id="Outline_Icons">
            <line
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="8"
                x1="15"
                y1="25"
                x2="85"
                y2="25"
            />
            <line
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="8"
                x1="15"
                y1="50"
                x2="85"
                y2="50"
            />
            <line
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="8"
                x1="15"
                y1="75"
                x2="85"
                y2="75"
            />
        </g>
    </Container>
)

const Container = styled.svg`
    stroke: ${color('link')};
`

export default Hamburger
