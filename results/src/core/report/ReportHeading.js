import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
// import { logoElements } from 'core/components/Logo'
import sample from 'lodash/sample'
import random from 'lodash/random'

export default ({ children }) => {
    const [part1, part2] = children.split('|')
    return (
        <Heading className="Heading Logo__Container">
            {/* <LogoElements className="LogoElements">
                {[1, 2, 3].map((i) => {
                    const Component = sample(logoElements)
                    return (
                        <div
                            key={i}
                            style={{
                                transform: `scale(${random(0.6, 1.4)})`,
                                top: `${random(10, 60)}%`,
                                left: `${random(10, 60)}%`,
                            }}
                        >
                            <Component />
                        </div>
                    )
                })}
            </LogoElements> */}
            <LogoContents className="LogoContents">
                <Part1>{part1.trim()}</Part1> <Part2>{part2.trim()}</Part2>
            </LogoContents>
        </Heading>
    )
}

const Heading = styled.h2`
    text-align: center;
    font-size: ${fontSize('huge')};
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding: 0 ${spacing(2)};
    font-weight: ${fontWeight('bold')};
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: visible !important;
`

const LogoElements = styled.div`
    position: absolute !important;
    opacity: 0.5;
`
const LogoContents = styled.div``

const Part1 = styled.span`
    display: block;
    position: relative;
    /* left: -${spacing(6)}; */
`

const Part2 = styled.span`
    display: block;
    position: relative;
    /* right: -${spacing(6)}; */
`
