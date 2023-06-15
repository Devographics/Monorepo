import React from 'react'
import styled from 'styled-components'
import { mq, fontWeight, fontSize, spacing, color } from 'core/theme'

const CodeExample = ({ language, code }: { language: string; code: string }) => (
    <Wrapper>
        <Language>{language}</Language>
        <Pre>
            <Code>{code}</Code>
        </Pre>
    </Wrapper>
)

const Wrapper = styled.div`
    position: relative;
    padding: ${spacing(1.5)} ${spacing(2)};
`

const Language = styled.h4`
    position: absolute;
    top: 0;
    right: 0;
    background: ${({ theme }) => theme.colors.link};
    padding: ${spacing(0.1)} ${spacing(0.4)};
    text-transform: uppercase;
    font-size: ${fontSize('small')};
`

const Pre = styled.pre`
    /* max-width: 300px; */
    /* overflow-x: scroll; */
    margin: 0;
`

const Code = styled.code`
    font-weight: ${fontWeight('medium')};
`

export default CodeExample
