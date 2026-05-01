import React, { useLayoutEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'
import { mq, spacing, color, fontSize } from 'core/theme'
import { useInView } from 'react-intersection-observer'

// From 0 (top) to 1(bottom), where in the viewport should the trigger happen
const buffer = 0.2
const bufferPercent = buffer * 100
const topViewportTriggerPoint = 1 - buffer
const bottomViewportTriggerPoint = buffer

// version 1 using IntersectionObserver
export const OverlayInterObs = ({ id, triggerId, setTriggerId, isFirst, isLast, children }) => {
    const { ref, inView, entry } = useInView({
        /* Optional options */
        rootMargin: `-${bufferPercent}% 0% -${bufferPercent}% 0%`,
        threshold: 0
    })

    // we need extra code to trigger setTriggerId() at the right times
    useLayoutEffect(() => {
        if (entry) {
            // trigger animation when element reaches trigger points
            const bottomTrigger = window.scrollY + window.innerHeight * bottomViewportTriggerPoint
            const topTrigger = window.scrollY + window.innerHeight * topViewportTriggerPoint
            const overlayTop = entry.boundingClientRect.top + window.scrollY
            const overlayBottom = entry.boundingClientRect.bottom + window.scrollY
            if (inView) {
                setTriggerId && setTriggerId(id)
            } else if (
                (isFirst && bottomTrigger <= overlayTop) ||
                (isLast && topTrigger > overlayBottom)
            ) {
                // we are leaving the first overlay going towards the top
                // we are leaving the last overlay going towards the bottom
                setTriggerId && setTriggerId(null)
            }
        }
    }, [inView, setTriggerId, id, entry, isFirst, isLast])

    return (
        <OverlayContainer className="OverlayContainer">
            <OverlayContents className="OverlayContents" ref={ref} isTriggered={inView}>
                {/* <ReactMarkdown source={children} escapeHtml={false} /> */}
                {children}
            </OverlayContents>
            <OverlaySpacer className="OverlaySpacer" />
        </OverlayContainer>
    )
}

// version 2 using onScroll
export const OverlayOnScroll = ({ id, triggerId, setTriggerId, isFirst, isLast, children }) => {
    const overlayRef = useRef()

    const isTriggered = triggerId === id

    // use a default position of +/-999999 so that animation never triggers
    const [overlayTop, setOverlayTop] = useState(999999)
    const [overlayBottom, setOverlayBottom] = useState(-999999)

    useLayoutEffect(() => {
        if (id) {
            const onScroll = () => {
                if (overlayTop === 999999) {
                    // if hint position hasn't been set yet, set it
                    setOverlayTop(overlayRef.current.getBoundingClientRect().top + window.scrollY)
                    setOverlayBottom(
                        overlayRef.current.getBoundingClientRect().bottom + window.scrollY
                    )
                }
                // trigger animation when element reaches trigger points
                const bottomTrigger =
                    window.scrollY + window.innerHeight * bottomViewportTriggerPoint
                const topTrigger = window.scrollY + window.innerHeight * topViewportTriggerPoint
                if (bottomTrigger <= overlayBottom && topTrigger > overlayTop) {
                    // console.log(`triggered! ${id}`)
                    setTriggerId && setTriggerId(id)
                    // once animation is triggered, remove event listener
                    // window.removeEventListener('scroll', onScroll)
                } else if (
                    (isFirst && bottomTrigger <= overlayTop) ||
                    (isLast && topTrigger > overlayBottom)
                ) {
                    // we are leaving the first overlay going towards the top
                    // we are leaving the last overlay going towards the bottom
                    setTriggerId && setTriggerId(null)
                }
            }
            window.addEventListener('scroll', onScroll)
            return () => window.removeEventListener('scroll', onScroll)
        }
    }, [isFirst, isLast, overlayBottom, overlayTop, id, setTriggerId])

    return (
        <OverlayContainer className="OverlayContainer">
            <OverlayContents className="OverlayContents" ref={overlayRef} isTriggered={isTriggered}>
                {/* <ReactMarkdown rehypePlugins={[rehypeRaw]}>{children}</ReactMarkdown> */}
            </OverlayContents>
            <OverlaySpacer className="OverlaySpacer" />
        </OverlayContainer>
    )
}

const OverlayContainer = styled.div`
    display: flex;
    /* background: #ff000011; */
    z-index: 100;
    position: relative;
    flex-direction: column;
    padding-top: ${spacing(2)};
    justify-content: flex-start;
    align-items: center;
`

const OverlaySpacer = styled.div`
    width: 100%;
    height: 100vh;
    pointer-events: none;
`
const OverlayContents = styled.div`
    /* background: ${color('backgroundAlt')}88; */
    background: #484f73bb;
    backdrop-filter: blur(5px);
    padding: ${spacing(1.5)};
    max-width: 600px;
    opacity: 0.3;
    transition: opacity 600ms ease-out;
    text-shadow: 0px 1px #00000099;
    ${({ isTriggered }) =>
        isTriggered &&
        css`
            /* background: rebeccapurple; */
            opacity: 1;
        `}
    box-shadow: ${({ theme }) => theme.blockShadow};
    p {
        font-size: ${fontSize('large')};
        line-height: 2;
        &:last-child {
            margin: 0;
        }
    }
`

export default OverlayInterObs
