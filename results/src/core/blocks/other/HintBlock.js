import React from 'react'
import PropTypes from 'prop-types'
import styled, { css, keyframes } from 'styled-components'
import { mq, spacing, fontSize, color } from 'core/theme'
import T from 'core/i18n/T'
import { useInView } from 'react-intersection-observer'

// From 0 (top) to 1(bottom), where in the viewport should the trigger happen
const buffer = 0.2
const bufferPercent = buffer * 100

const HintBlock = ({ block, data }) => {
    const { id } = block

    const { ref: hintRef, inView, entry } = useInView({
        /* Optional options */
        rootMargin: `-${bufferPercent}% 0% -${bufferPercent}% 0%`,
        threshold: 0,
        triggerOnce: true,
    })

    return (
        <HintContainer className="Block" ref={hintRef} animate={inView}>
            <HintBulb>
                <HintBulbInner animate={inView}>
                    <span className="bulb" role="img" aria-label="Lightbulb Emoji">
                        💡
                    </span>
                    <span className="spark spark-1">
                        <span />
                    </span>
                    <span className="spark spark-2">
                        <span />
                    </span>
                    <span className="spark spark-3">
                        <span />
                    </span>
                </HintBulbInner>
            </HintBulb>
            <HintContent>
                <T k={`hints.${id}`} md={true} />
            </HintContent>
        </HintContainer>
    )
}

const animate = (animation) => ({ animate }) =>
    animate &&
    css`
        animation: ${animation} 1100ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0ms 1 forwards;
    `

const spark = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: translateY(-60%);
    opacity: 0;
  }
`

const bgGlow = keyframes`
  0% {
    background: ${color('backgroundAlt')};
  }
  30% {
    background: #fce49155;
  }
  100% {
    background: #fce49125;
  }
`

const glow = keyframes`
  0% {
    text-shadow: 0px 2px 4px #fce49100;
        transform: scale(0.6);
  }
  30% {
    text-shadow: 0px 2px 8px #fce491cc;
        transform: scale(1.2);
  }
  100% {
    text-shadow: 0px 2px 2px #fce49166;
        transform: scale(1);
  }
`

HintBlock.propTypes = {
    section: PropTypes.string,
}

const HintContainer = styled.div`
    margin-bottom: ${spacing(2)};
    background: ${color('backgroundAlt')};
    display: grid;
    column-gap: ${spacing()};
    ${animate(bgGlow)}
    @media ${mq.small} {
        padding: ${spacing()};
        grid-template-columns: 30px auto;
    }
    @media ${mq.mediumLarge} {
        padding: ${spacing()};
        grid-template-columns: 60px auto;
    }
`

const HintBulb = styled.div`
    display: grid;
    place-items: center;

    @media ${mq.small} {
        margin-bottom: ${spacing(0.5)};
    }
`

const HintBulbInner = styled.div`
    position: relative;
    .bulb {
        display: block;
        font-size: ${fontSize('largest')};
        text-shadow: 0px 2px 4px #fce49100;
        transform: scale(0.6);
        ${animate(glow)}
    }
    .spark {
        display: block;
        position: absolute;
        span {
            display: block;
            border-radius: 500px;
            background: #fce49166;
            width: 4px;
            height: 14px;
            box-shadow: 0px 2px 4px #fce49166;

            opacity: 0;
            ${animate(spark)}
        }
    }
    .spark-1 {
        top: -20%;
        left: -10%;
        transform: translateX(-50%) rotate(-30deg);
    }
    .spark-2 {
        top: -30%;
        left: 50%;
        transform: translateX(-50%);
    }
    .spark-3 {
        top: -20%;
        right: -10%;
        transform: rotate(30deg);
    }
`

const HintContent = styled.div`
    font-size: ${fontSize('smallish')};
    p:last-child {
        margin: 0;
    }
`

export default HintBlock
