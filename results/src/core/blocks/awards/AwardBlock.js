import React, { memo, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import styled, { useTheme, keyframes } from 'styled-components'
import Confetti from 'react-confetti'
import tinycolor from 'tinycolor2'
import ShareBlock from 'core/share/ShareBlock'
import { useI18n } from 'core/i18n/i18nContext'
import { mq, spacing, fontSize } from 'core/theme'
import AwardIcon from './AwardIcon'
import { useEntities } from 'core/entities/entitiesContext'
import T from 'core/i18n/T'

const AwardBlock = ({ block }) => {
    const { getEntity } = useEntities()

    const { id, awards } = block
    const type = id
    const { translate } = useI18n()
    const theme = useTheme()

    const [isRevealed, setIsRevealed] = useState(false)
    const handleClick = useCallback(() => {
        setIsRevealed(true)
    }, [setIsRevealed])

    const awardsWithEntities = awards.map((a) => ({ ...a, entity: getEntity(a.id) }))
    const winner = awardsWithEntities[0]
    const runnerUps = awardsWithEntities.slice(1)

    return (
        <Container className={`Award Award--${isRevealed ? 'show' : 'hide'}`} id={type}>
            <Heading className="Award__Heading">{translate(`award.${type}.title`)}</Heading>
            <Description className="Award__Description">
                <T k={`award.${type}.description`} />
            </Description>
            <ElementContainer className="Award__Element__Container">
                <Element className="Award__Element" onClick={handleClick}>
                    <FrontSide className="Award__Element__Face Award__Element__Face--front">
                        <AwardIcon />
                    </FrontSide>
                    <BackSide className="Award__Element__Face Award__Element__Face--back">
                        {isRevealed && (
                            <ConfettiContainer>
                                <Confetti
                                    width="500px"
                                    height="300px"
                                    recycle={false}
                                    numberOfPieces={80}
                                    initialVelocityX={5}
                                    initialVelocityY={20}
                                    confettiSource={{ x: 200, y: 100, w: 100, h: 100 }}
                                    colors={theme.colors.distinct}
                                />
                            </ConfettiContainer>
                        )}
                        {/* <PeriodicElement
                            tool={winner.id}
                            name={winner.name || winner.id}
                            symbol={periodicTableData.tools[winner.id] || '??'}
                            number={`#1` || '?'}
                        /> */}
                        <Winner>
                            <EntityItem entity={winner.entity} />
                        </Winner>
                    </BackSide>
                </Element>
            </ElementContainer>
            <Comment className="Award__Comment">
                <T k={`award.${type}.comment`} md={true} values={{ value: winner.value }} />
                {/* <ShareBlock
                    title={`${translate(`award.${type}.title`)}`}
                    block={block}
                    className="Award__Share"
                /> */}
            </Comment>
            <div className="Awards__RunnerUps">
                <RunnerUpsHeading className="Awards__RunnerUps__Heading">
                    <T k="awards.runner_ups" />
                </RunnerUpsHeading>
                {runnerUps.map((runnerUp, i) => (
                    <RunnerUpsItem key={runnerUp.id} className="Awards__RunnerUps__Item">
                        {i + 2}. <EntityItem entity={runnerUp.entity} />
                        {runnerUp.value ? `: ${runnerUp.value}` : ''}
                    </RunnerUpsItem>
                ))}
            </div>
        </Container>
    )
}

const EntityItem = ({ entity }) => {
    const { name, homepage, mdn } = entity
    const url = homepage.url || mdn?.url
    return url ? <a href={url}>{name}</a> : <span>{name}</span>
}

AwardBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        awards: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).number,
            })
        ).isRequired,
    }).isRequired,
}

const Container = styled.div`
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;

    @media ${mq.smallMedium} {
        margin-bottom: ${spacing(3)};
    }

    .Award__Share {
        margin-bottom: ${spacing()};
    }
`

const Heading = styled.h3`
    margin-bottom: ${spacing(0.25)};
    font-size: 1.5rem;
`

const Description = styled.div`
    margin-bottom: ${spacing()};
    font-size: ${fontSize('smallish')};
`

const ElementContainer = styled.div`
    position: relative;
    height: 150px;
    width: 150px;
    perspective: 800px;
    margin-bottom: ${spacing()};
`

const getGlowColor = (color, alpha) => tinycolor(color).setAlpha(alpha).toRgbString()

const glowSoft = (theme) => keyframes`
    from {
        box-shadow: 0px 1px 1px 1px ${getGlowColor(theme.colors.link, 0.1)};
    }
    50% {
        box-shadow: 0px 1px 20px 1px ${getGlowColor(theme.colors.link, 0.4)};
    }
    to {
        box-shadow: 0px 1px 1px 1px ${getGlowColor(theme.colors.link, 0.1)};
    }
`

const glow = (theme) => keyframes`
    from {
        box-shadow: 0px 1px 2px 1px ${getGlowColor(theme.colors.link, 0.5)};
    }
    50% {
        box-shadow: 0px 1px 30px 2px ${getGlowColor(theme.colors.link, 0.9)};
    }
    to {
        box-shadow: 0px 1px 2px 1px ${getGlowColor(theme.colors.link, 0.5)};
    }
`

const burst = (theme) => keyframes`
    from {
        box-shadow: 0px 0px 0px 0px ${getGlowColor(theme.colors.link, 0)};
    }
    50% {
        box-shadow: 0px 0px 30px 30px ${getGlowColor(theme.colors.link, 0.9)};
    }
    to {
        box-shadow: 0px 0px 60px 60px ${getGlowColor(theme.colors.link, 0)};
    }
`

const Element = styled.div`
    position: absolute;
    height: 100%;
    width: 100%;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: rotateY(0deg) scale(0.75);
    cursor: pointer;
    margin-bottom: ${spacing()};

    svg {
        display: block;
    }

    .Award--hide & {
        animation-name: ${({ theme }) => glowSoft(theme)};
        animation-duration: 3000ms;
        animation-iteration-count: infinite;
        animation-timing-function: linear;

        &:hover {
            animation-name: ${({ theme }) => glow(theme)};
            animation-duration: 1200ms;
        }
    }

    .Award--show & {
        animation-name: ${({ theme }) => burst(theme)};
        animation-duration: 500ms;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
    }

    .Award--show &,
    .capture & {
        cursor: default;
        transform: rotateY(540deg) scale(1);
    }
`

const Side = styled.div`
    position: absolute;
    height: 100%;
    width: 100%;
    backface-visibility: hidden;
`

const FrontSide = styled(Side)`
    background: ${({ theme }) => theme.colors.backgroundAlt};
    padding: ${spacing(0.5)};

    svg {
        .bg {
            transition: all 150ms ease-in;
            stroke: $navy;
            stroke-width: 15;
        }
        .fg {
            fill: ${({ theme }) => theme.colors.link};

            text {
                font-size: 250px;
            }
        }
    }

    .Award__Element:hover & {
        .bg {
            stroke: rgba($teal, 0.5);
        }
    }
`

const BackSide = styled(Side)`
    background: ${({ theme }) => theme.colors.background};
    transform: rotateY(180deg);
    font-size: ${fontSize('largest')};
    display: flex;
    align-items: center;
    justify-content: center;
`

const Comment = styled.div`
    transition: ease-in opacity 500ms 500ms;
    display: flex;
    flex-direction: column;
    align-items: center;

    p {
        margin-bottom: ${spacing(0.5)};
    }

    .Award--hide & {
        opacity: 0;
    }
    .Award--show &,
    .capture & {
        opacity: 1;
    }
`

const RunnerUpsHeading = styled.h4`
    transition: ease-in opacity 500ms 1000ms;
    opacity: 0;
    margin-bottom: 0;

    .Award--show &,
    .capture & {
        opacity: 1;
    }
`

const RunnerUpsItem = styled.div`
    opacity: 0;
    font-size: ${fontSize('smallish')};

    .Award--show &,
    .capture & {
        opacity: 1;
    }

    &:nth-child(2) {
        transition: ease-in opacity 300ms 1500ms;
    }
    &:nth-child(3) {
        transition: ease-in opacity 300ms 1800ms;
    }
`

const ConfettiContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;

    canvas {
        transform: translate(-50%, -50%);
    }
`

const Winner = styled.div``

export default memo(AwardBlock)
