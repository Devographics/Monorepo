import React, { memo, useState, useCallback } from 'react'
import styled, { useTheme, keyframes } from 'styled-components'
import Confetti from 'react-confetti'
import tinycolor from 'tinycolor2'
import { useI18n } from '@devographics/react-i18n'
import AwardIcon from './AwardIcon'
import T from 'core/i18n/T'
import { getItemLabel } from 'core/helpers/labels'
import { Entity } from '@devographics/types'
import { Award } from 'core/types'
import './AwardBlock.scss'

/**
 * Awards for one category (= winner and runner ups for this category)
 */
const AwardBlock = ({
    block,
    entities
}: {
    block: { id: string; awards: Array<Award> }
    entities: Array<Entity>
}) => {
    const { id, awards } = block
    const type = id
    const { translate } = useI18n()
    const theme = useTheme()

    const [isRevealed, setIsRevealed] = useState(false)
    const handleClick = useCallback(() => {
        setIsRevealed(true)
    }, [setIsRevealed])

    const awardsWithEntities = awards.map(a => ({
        ...a,
        entity: entities.find(e => e.id === a.id)
    }))
    const winner = awardsWithEntities[0]
    const runnerUps = awardsWithEntities.slice(1)

    return (
        <div className={`award-container Award Award--${isRevealed ? 'show' : 'hide'}`} id={type}>
            <h3 className="award-heading Award__Heading">{translate(`award.${type}.title`)}</h3>
            <div className="award-description Award__Description">
                <T k={`award.${type}.description`} />
            </div>
            <div className="award-element-container Award__Element__Container">
                <Element className="Award__Element" onClick={handleClick}>
                    <div className="award-side award-side-front Award__Element__Face Award__Element__Face--front">
                        <AwardIcon />
                    </div>
                    <div className="award-side award-side-back Award__Element__Face Award__Element__Face--back">
                        {isRevealed && (
                            <div className="award-confetti-container">
                                <Confetti
                                    width={500}
                                    height={300}
                                    recycle={false}
                                    numberOfPieces={80}
                                    initialVelocityX={5}
                                    initialVelocityY={20}
                                    confettiSource={{ x: 200, y: 100, w: 100, h: 100 }}
                                    colors={theme.colors.distinct}
                                />
                            </div>
                        )}
                        {/* <PeriodicElement
                            tool={winner.id}
                            name={winner.name || winner.id}
                            symbol={periodicTableData.tools[winner.id] || '??'}
                            number={`#1` || '?'}
                        /> */}
                        <div className="award-winner">
                            {winner.entity ? (
                                <EntityItem id={winner.id} entity={winner.entity} />
                            ) : (
                                'Error: no entity found'
                            )}
                        </div>
                    </div>
                </Element>
            </div>
            <div className="award-comment Award__Comment">
                <T k={`award.${type}.comment`} md={true} values={{ value: winner.value }} />
                {/* <ShareBlock
                    title={`${translate(`award.${type}.title`)}`}
                    block={block}
                    className="Award__Share"
                /> */}
            </div>
            <div className="Awards__RunnerUps">
                <h4 className="award-runnersup-heading Awards__RunnerUps__Heading">
                    <T k="awards.runner_ups" />
                </h4>
                {runnerUps.map((runnerUp, i) => (
                    <div
                        key={runnerUp.id}
                        className="awards-runnersup-item Awards__RunnerUps__Item"
                    >
                        {i + 2}.{' '}
                        {runnerUp.entity ? (
                            <EntityItem id={runnerUp.id} entity={runnerUp.entity} />
                        ) : (
                            'Error: no entity found'
                        )}
                        {runnerUp.value ? `: ${runnerUp.value}` : ''}
                    </div>
                ))}
            </div>
        </div>
    )
}

const EntityItem = ({ id, entity }: { id: string; entity: Entity }) => {
    const { getString } = useI18n()
    if (!entity) {
        return <span>missing entity</span>
    }
    const { label } = getItemLabel({ id, entity, getString, i18nNamespace: 'features' })
    const { homepage, mdn, resources = [] } = entity
    const url = homepage?.url || mdn?.url || resources[0]?.url
    return url ? <a href={url}>{label}</a> : <span>{label}</span>
}

/*
AwardBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired
}
*/

const getGlowColor = (color: any, alpha: number) => tinycolor(color).setAlpha(alpha).toRgbString()

const glowSoft = (theme: any) => keyframes`
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

const glow = (theme: any) => keyframes`
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

const burst = (theme: any) => keyframes`
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
    margin-bottom: var(--spacing);

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

export default memo(AwardBlock)
