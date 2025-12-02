import React from 'react'
import styled, { keyframes } from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'

interface LogoProps {
    className?: string
    animated?: boolean
    size?: string
    showText?: boolean
}

export const Logo = ({ className, animated = true, showText = true, size = 'l' }: LogoProps) => (
    <Wrapper aria-label="State of CSS 2025" className="logo__wrapper">
        <div className="soh-logo__wrapper">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width={600}
                height={600}
                className="soh-logo"
                viewBox="0 0 1819.33 1819.33"
            >
                <title>{'State of HTML 2025'}</title>
                <defs>
                    <linearGradient
                        id="soh-grad-slash-1"
                        x1={431.96}
                        x2={774.71}
                        y1={989.95}
                        y2={1187.83}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-slash-one-a)" />
                        <stop offset={0.33} stopColor="var(--color-slash-one-b)" />
                        <stop offset={1} stopColor="var(--color-slash-one-c)" />
                    </linearGradient>
                    <linearGradient
                        id="soh-grad-slash-2"
                        x1={3140.05}
                        x2={3711.29}
                        y1={3222.07}
                        y2={3551.87}
                        gradientTransform="matrix(.6 0 0 .6 -1328.87 -1014.18)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-slash-two-a)" />
                        <stop offset={0.33} stopColor="var(--color-slash-two-b)" />
                        <stop offset={0.67} stopColor="var(--color-slash-two-c)" />
                        <stop offset={1} stopColor="var(--color-slash-two-d)" />
                    </linearGradient>
                    <linearGradient
                        id="soh-grad-slash-3"
                        x1={16680.49}
                        x2={18394.22}
                        y1={14382.64}
                        y2={15372.07}
                        gradientTransform="matrix(.2 0 0 .2 -2657.74 -2028.37)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-slash-three-a)" />
                        <stop offset={0.33} stopColor="var(--color-slash-three-b)" />
                        <stop offset={0.67} stopColor="var(--color-slash-three-c)" />
                        <stop offset={1} stopColor="var(--color-slash-three-d)" />
                    </linearGradient>
                    <linearGradient
                        id="soh-grad-slash-4"
                        x1={-25642.39}
                        x2={-23928.66}
                        y1={-20095.54}
                        y2={-19106.12}
                        gradientTransform="matrix(-.2 0 0 -.2 -3986.62 -3042.55)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-slash-three-a)" />
                        <stop offset={0.33} stopColor="var(--color-slash-three-b)" />
                        <stop offset={0.67} stopColor="var(--color-slash-three-c)" />
                        <stop offset={1} stopColor="var(--color-slash-three-d)" />
                    </linearGradient>
                    <linearGradient
                        id="soh-grad-slash-5"
                        x1={-10967.58}
                        x2={-10396.33}
                        y1={-8270.66}
                        y2={-7940.86}
                        gradientTransform="matrix(-.6 0 0 -.6 -5315.49 -4056.74)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-slash-two-a)" />
                        <stop offset={0.33} stopColor="var(--color-slash-two-b)" />
                        <stop offset={0.67} stopColor="var(--color-slash-two-c)" />
                        <stop offset={1} stopColor="var(--color-slash-two-d)" />
                    </linearGradient>
                    <linearGradient
                        xlinkHref="#soh-grad-slash-1"
                        id="soh-grad-slash-6"
                        x1={-8031.95}
                        x2={-7689.2}
                        y1={-5906.07}
                        y2={-5708.18}
                        gradientTransform="rotate(-180 -3322.18 -2535.46)"
                    />
                    <linearGradient
                        id="soh-grad-chevron-back-a"
                        x1={102.8}
                        x2={764.43}
                        y1={736.73}
                        y2={736.73}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-chevron-back-a)" />
                        <stop offset={1} stopColor="var(--color-chevron-back-b)" />
                    </linearGradient>
                    <linearGradient
                        xlinkHref="#soh-grad-chevron-back-a"
                        id="soh-grad-chevron-back-b"
                        x1={-12254.28}
                        x2={-11592.65}
                        y1={731.48}
                        y2={731.48}
                        gradientTransform="rotate(-180 -5268.76 909.92)"
                    />
                    <linearGradient
                        id="soh-grad-chevron-front-a"
                        x1={-12254.28}
                        x2={-11549.08}
                        y1={1107.33}
                        y2={1107.33}
                        gradientTransform="rotate(-180 -5268.76 909.92)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-chevron-front-a)" />
                        <stop offset={1} stopColor="var(--color-chevron-front-b)" />
                    </linearGradient>
                    <linearGradient
                        xlinkHref="#soh-grad-chevron-front-a"
                        id="soh-grad-chevron-front-b"
                        x1={-3148.73}
                        x2={-2443.05}
                        y1={7650.22}
                        y2={7650.22}
                        gradientTransform="translate(3251.52 -6537.5)"
                    />
                    <symbol id="soh-front-chevron-right">
                        <path
                            id="soh-front-chevron-right-path"
                            d="M1716.76 765.74 1076.4 396.03l-64.84 225.83 705.2 407.14V765.74z"
                        />
                    </symbol>
                    <symbol id="soh-front-chevron-left">
                        <path
                            id="soh-front-chevron-left-path"
                            d="m102.8 1059.35 640.82 369.99 64.85-225.83L102.8 796.09v263.26z"
                        />
                    </symbol>
                    <clipPath id="soh-front-chevron-right-clip">
                        <use xlinkHref="#soh-front-chevron-right-path" />
                    </clipPath>
                    <clipPath id="soh-front-chevron-left-clip">
                        <use xlinkHref="#soh-front-chevron-left-path" />
                    </clipPath>
                    <symbol id="soh-back-chevron-left">
                        <path
                            id="soh-back-chevron-left-path"
                            d="M725.56 436.54 102.8 796.09 102.8 1059.35 634.92 752.13 725.56 436.54z"
                        />
                    </symbol>
                    <symbol id="soh-back-chevron-right">
                        <path
                            id="soh-back-chevron-right-path"
                            d="M1093.99 1388.56 1716.76 1029 1716.76 765.74 1184.62 1072.97 1093.99 1388.56z"
                        />
                    </symbol>
                    <clipPath id="soh-back-chevron-left-clip">
                        <use xlinkHref="#soh-back-chevron-left-path" />
                    </clipPath>
                    <clipPath id="soh-back-chevron-right-clip">
                        <use xlinkHref="#soh-back-chevron-right-path" />
                    </clipPath>
                    <symbol id="soh-shape-html">
                        <path
                            id="soh-shape-html-path"
                            d="m715.04 758.7-86.72 302.44h-88.41l32.52-113.41-44.62 25.2-25.3 88.21H414.1l86.72-302.43h88.41l-32.52 113.41 44.62-25.2 25.3-88.21h88.41Zm489.41 0v.01l-44.62 25.2 7.23-25.2h-88.42l-44.62 25.2 7.23-25.2h-88.41l-86.73 302.43h88.42l50.58-176.42 44.63-25.2-57.82 201.62h88.42l50.58-176.42 44.62-25.2-57.8 201.62h88.4l86.72-302.43h-88.4Zm140.66 214.03 61.37-214.02h-88.41l-86.72 302.43h176.82l25.35-88.41h-88.4Zm-430.23-125.6 25.35-88.42H727.64l-25.35 88.41h62.09l-61.37 214.02h88.41l61.37-214.02h62.1Z"
                            pathLength={1}
                        />
                    </symbol>
                    <symbol id="soh-shape-html-letter-h">
                        <path
                            d="m715.04 758.71-86.72 302.43h-88.41l32.52-113.41-44.62 25.2-25.3 88.21H414.1l86.72-302.43h88.41l-32.52 113.41 44.62-25.2 25.3-88.21h88.41z"
                            pathLength={1}
                        />
                    </symbol>
                    <symbol id="soh-shape-html-letter-t">
                        <path
                            d="m914.88 847.12 25.35-88.41H727.64l-25.35 88.41h62.09l-61.37 214.02h88.41l61.37-214.02h62.09z"
                            pathLength={1}
                        />
                    </symbol>
                    <symbol id="soh-shape-html-letter-m">
                        <path
                            d="m1204.45 758.71-44.62 25.2 7.23-25.2h-88.42l-44.62 25.2 7.23-25.2h-88.42l-86.72 302.43h88.42l50.58-176.42 44.63-25.2-57.82 201.62h88.42l50.58-176.42 44.62-25.2-57.81 201.62h88.41l86.72-302.43h-88.41z"
                            pathLength={1}
                        />
                    </symbol>
                    <symbol id="soh-shape-html-letter-l">
                        <path
                            d="M1406.48 758.71 1318.07 758.71 1231.35 1061.14 1408.17 1061.14 1433.52 972.73 1345.11 972.73 1406.48 758.71z"
                            pathLength={1}
                        />
                    </symbol>
                    <clipPath id="soh-shape-html-mask">
                        <use xlinkHref="#soh-shape-html-path" />
                    </clipPath>
                    <linearGradient
                        id="soh-grad-logo"
                        x1={1749.88}
                        x2={2743.54}
                        y1={770.39}
                        y2={1074.18}
                        gradientTransform="matrix(1 0 -.29 1 -1035.08 0)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-grad-shape-a)" />
                        <stop offset={1} stopColor="var(--color-grad-shape-b)" />
                    </linearGradient>
                </defs>
                <g className="soh-back-chevrons">
                    <g clipPath="url(#soh-back-chevron-left-clip)">
                        <use
                            xlinkHref="#soh-back-chevron-left"
                            className="soh-back-chevron soh-back-chevron--left"
                            fill="url(#soh-grad-chevron-back-a)"
                        />
                    </g>
                    <g clipPath="url(#soh-back-chevron-right-clip)">
                        <use
                            xlinkHref="#soh-back-chevron-right"
                            className="soh-back-chevron soh-back-chevron--right"
                            fill="url(#soh-grad-chevron-back-b)"
                        />
                    </g>
                </g>
                <g className="soh-slashes-clipped">
                    <g className="soh-slashes">
                        <path
                            className="soh-slash--a"
                            fill="url(#soh-grad-slash-1)"
                            d="m750.28 576.24 53.02-184.58-38.87 22.44-389.31 1355.7 29.26 16.9 36.86-21.28L778.1 592.3l-27.82-16.06z"
                            style={{
                                '--subindex': 1
                            }}
                        />
                        <path
                            className="soh-slash--b"
                            fill="url(#soh-grad-slash-2)"
                            d="m537.93 1678.95-10.55 36.75 37.25-21.51L911.94 484.71l-28.11-16.22 42.46-147.84-38.46 22.21-378.87 1319.36 28.97 16.73z"
                            style={{
                                '--subindex': 2
                            }}
                        />
                        <path
                            className="soh-slash--c"
                            fill="url(#soh-grad-slash-3)"
                            d="m671.48 1571.2-21.11 73.49 37.66-21.75 357.44-1244.77-28.4-16.39 32.22-112.14-38.07 21.97-368.43 1283.03 28.69 16.56z"
                            style={{
                                '--subindex': 3
                            }}
                        />
                        <path
                            className="soh-slash--d"
                            fill="url(#soh-grad-slash-4)"
                            d="m802.95 1463.59-32.02 111.49 38.06-21.98 368.59-1283.55-28.69-16.55 20.96-72.97-37.66 21.74L774.56 1447.2l28.39 16.39z"
                            style={{
                                '--subindex': 3
                            }}
                        />
                        <path
                            className="soh-slash--e"
                            fill="url(#soh-grad-slash-5)"
                            d="m936.54 1355.7-42.62 148.37 38.47-22.21 379.02-1319.89-28.97-16.72 10.4-36.23-37.25 21.51-347.16 1208.95 28.11 16.22z"
                            style={{
                                '--subindex': 2
                            }}
                        />
                        <path
                            className="soh-slash--f"
                            fill="url(#soh-grad-slash-6)"
                            d="m1069.27 1248.85-53.02 184.58 38.87-22.44 389.31-1355.7-29.26-16.89-36.85 21.27-336.87 1173.13 27.82 16.05z"
                            style={{
                                '--subindex': 1
                            }}
                        />
                    </g>
                </g>
                <g className="soh-shape-group">
                    <g
                        clipPath="url(#soh-shape-html-mask)"
                        transform="translate(11.28328337 15.8194327)"
                    >
                        <use
                            xlinkHref="#soh-shape-html"
                            fill="var(--color-shape-shadow-bg)"
                            className="soh-shape--shadow-bg"
                        />
                        <g
                            fill="transparent"
                            stroke="var(--color-shape-shadow-stroke)"
                            strokeWidth={12}
                        >
                            <use
                                xlinkHref="#soh-shape-html-letter-h"
                                className="soh-shape--shadow-stroke"
                                pathLength={1}
                            />
                            <use
                                xlinkHref="#soh-shape-html-letter-t"
                                className="soh-shape--shadow-stroke"
                                pathLength={1}
                            />
                            <use
                                xlinkHref="#soh-shape-html-letter-m"
                                className="soh-shape--shadow-stroke"
                                pathLength={1}
                            />
                            <use
                                xlinkHref="#soh-shape-html-letter-l"
                                className="soh-shape--shadow-stroke"
                                pathLength={1}
                            />
                        </g>
                    </g>
                    <g>
                        <use
                            xlinkHref="#soh-shape-html"
                            fill="url(#soh-grad-logo)"
                            className="soh-shape--fill"
                        />
                    </g>
                </g>
                <g className="soh-front-chevrons">
                    <g clipPath="url(#soh-front-chevron-right-clip)">
                        <use
                            xlinkHref="#soh-front-chevron-right"
                            className="soh-front-chevron soh-front-chevron--right"
                            fill="url(#soh-grad-chevron-front-a)"
                        />
                    </g>
                    <g clipPath="url(#soh-front-chevron-left-clip)">
                        <use
                            xlinkHref="#soh-front-chevron-left"
                            className="soh-front-chevron soh-front-chevron--left"
                            fill="url(#soh-grad-chevron-front-b)"
                        />
                    </g>
                </g>
                <g>
                    <g transform="rotate(30)">
                        <g className="soh-text soh-text--stateof">
                            <text x={1070} y={660} fontSize={90}>
                                <tspan>{'S'}</tspan>
                                <tspan>{'T'}</tspan>
                                <tspan>{'A'}</tspan>
                                <tspan>{'T'}</tspan>
                                <tspan>{'E'}</tspan>
                                <tspan> </tspan>
                                <tspan>{'O'}</tspan>
                                <tspan>{'F'}</tspan>
                            </text>
                        </g>
                    </g>
                    <g transform="rotate(30)">
                        <g className="soh-text soh-text--year">
                            <text x={728} y={1260} fontSize={100} textAnchor="end">
                                <tspan data-year-char={1}>{'2'}</tspan>
                                <tspan data-year-char={2}>{'0'}</tspan>
                                <tspan data-year-char={3}>{'2'}</tspan>
                                <tspan data-year-char={4}>{'5'}</tspan>
                            </text>
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    </Wrapper>
)

const Wrapper = styled.div`
    margin: 0 auto;
    margin-bottom: ${spacing()};
    width: 100%;

    [hidden] {
        display: none !important;
    }

    @font-face {
        font-family: 'Bebas Neue';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url(./BebasNeue-STATEOFDIGITS.woff2) format('woff2');
    }

    .soh-logo__wrapper {
        --color-text: #1f473e;
        --color-bg: #4a564b;
        --color-slash-one-a: #6ebc60;
        --color-slash-one-b: #15e595;
        --color-slash-one-c: #3595ec;
        --color-slash-two-a: #6ebc60;
        --color-slash-two-b: #15e595;
        --color-slash-two-c: #4872f1;
        --color-slash-two-d: #3595ec;
        --color-slash-three-a: #6ebc60;
        --color-slash-three-b: #15e595;
        --color-slash-three-c: #3595ec;
        --color-slash-three-d: #3595ec;
        --color-chevron-back-a: #4a8da4;
        --color-chevron-back-b: #190941;
        --color-chevron-front-a: #8bee7d;
        --color-chevron-front-b: #fff873;
        --color-grad-shape-a: #fff6e6;
        --color-grad-shape-b: #ffdea4;
        --color-shape-shadow-bg: #040823;
        --color-shape-shadow-stroke: #b5ebad;
        --timeline-base-delay: 100ms;
        --timeline-chevron-front-anim: 600ms;
        --timeline-chevron-front-delay: var(--timeline-base-delay);
        --timeline-chevron-back-anim: calc(var(--timeline-chevron-front-anim) * 0.75);
        --timeline-chevron-back-delay: calc(
            var(--timeline-chevron-front-delay) + var(--timeline-chevron-front-anim) * 0.75
        );
        --timeline-slash-anim: 600ms;
        --timeline-slash-delay: calc(
            var(--timeline-chevron-back-delay) + var(--timeline-slash-anim) * 0.25
        );
        --timeline-slash-sub-delay: 250ms;
        --timeline-shape-shadow-bg-delay: var(--timeline-slash-delay);
        --timeline-shape-shadow-bg-anim: 800ms;
        --timeline-shape-shadow-stroke-delay: calc(
            var(--timeline-shape-shadow-bg-delay) + var(--timeline-shape-shadow-bg-anim) * 0.75
        );
        --timeline-shape-shadow-stroke-anim: 1200ms;
        --timeline-shape-fill-delay: calc(
            var(--timeline-shape-shadow-stroke-delay) + var(--timeline-shape-shadow-stroke-anim)
        );
        --timeline-shape-fill-anim: 1200ms;
        --timeline-text-anim: 1200ms;
        --timeline-text-delay: calc(
            var(--timeline-shape-fill-delay) + var(--timeline-shape-fill-anim)
        );
        --ease-whisk-out: cubic-bezier(0, 1, 0.15, 1);
        --ease-whisk-in-out: cubic-bezier(0.85, 0, 0.15, 1);
        --ease-soft-out: cubic-bezier(0, 0, 0.15, 1);
        --ease-circ-in: cubic-bezier(0, 0, 1, 0);
        --ease-circ-out: cubic-bezier(0, 0, 0, 1);
        --ease-more-circ-out: cubic-bezier(0, 0.5, 0, 1);
        --ease-bouncy-out: cubic-bezier(0.6, 1.5, 0.4, 1);
        --ease-bouncy-out: cubic-bezier(0.47, 1.97, 0, 0.71);
        --ease-bouncy-in-out: cubic-bezier(0.25, -0.25, 0.1, 1.25);
        --ease-true-bounce-out: var(--ease-bouncy-out);
        --ease-linear-soft-out: cubic-bezier(0.5, 0.5, 0.5, 1);
        /* background: var(--color-bg); */
    }

    @supports (transition-timing-function: linear(0.1 1%, 0.9 99%)) {
        .soh-logo__wrapper {
            --ease-true-bounce-out: linear(
                0,
                0.049 1.1%,
                0.199 2.4%,
                1.232 8.2%,
                1.383,
                1.443 11.2%,
                1.429,
                1.364 13.7%,
                0.892 19.7%,
                0.829,
                0.803 22.6%,
                0.809 23.8%,
                0.838 25.2%,
                1.048 31.1%,
                1.076,
                1.087 34%,
                1.077 36.2%,
                0.984 42.1%,
                0.961 45.4%,
                0.966 47.7%,
                1.007 53.5%,
                1.017 56.8%,
                0.992,
                1.003 79.3%,
                1
            );
        }
    }

    .soh-logo {
        width: 100%;
        height: auto;
    }
    .soh-logo__wrapper {
        position: relative;
        display: grid;
        width: 100vmin;
        max-width: 400px;
        aspect-ratio: 1;
        margin: auto;
        /* background: var(--color-bg, midnightblue); */
    }

    .soh-logo * {
        transform-box: fill-box;
        transform-origin: 50% 50%;
    }

    .soh-slashes {
        --total-count: 6;
        --sub-count: calc(var(--total-count) / 2);
        --dir: 1;
        --a: 73deg;
        --angle: calc(73deg + 90deg);
        --offset: 200px;
    }
    .soh-slashes > * {
        animation: angleSlideIn var(--timeline-slash-anim) var(--ease-whisk-out)
            calc(
                var(--timeline-slash-delay) + var(--timeline-slash-sub-delay) *
                    (var(--sub-count) - var(--subindex))
            )
            backwards 1;
    }
    .soh-slashes > :nth-child(n + 4) {
        --dir: -1;
    }

    .soh-back-chevron {
        --dir: 1;
        --angle: calc(29deg + 180deg);
        --offset: 909px;
        --starting-opacity: 1;
        animation: angleSlideIn var(--timeline-chevron-back-anim) var(--ease-linear-soft-out)
            var(--timeline-chevron-back-delay) backwards 1;
    }
    .soh-back-chevron--left {
        --dir: -1;
    }

    .soh-front-chevron {
        --dir: 1;
        --angle: 29deg;
        --offset: 909px;
        --starting-opacity: 1;
        animation: angleSlideIn var(--timeline-chevron-front-anim) var(--ease-circ-in, linear)
            var(--timeline-chevron-front-delay) backwards 1;
    }
    .soh-front-chevron--right {
        --dir: -1;
    }

    .soh-shape--shadow-bg {
        animation: scaleIn var(--timeline-shape-shadow-bg-anim) var(--ease-bouncy-in-out)
            var(--timeline-shape-shadow-bg-delay) backwards 1;
        animation-timing-function: var(--ease-true-bounce-out);
    }
    .soh-shape--shadow-stroke {
        stroke-dasharray: 1 1;
        stroke-dashoffset: 0;
        animation: lineIn var(--timeline-shape-shadow-stroke-anim) var(--ease-soft-out)
            var(--timeline-shape-shadow-stroke-delay) backwards 1;
    }
    .soh-shape--fill {
        animation: fadeIn var(--timeline-shape-fill-anim) var(--ease-circ-out)
                var(--timeline-shape-fill-delay) backwards 1,
            untranslateIn var(--timeline-shape-fill-anim) var(--ease-circ-out)
                calc(var(--timeline-shape-fill-anim) / 3 + var(--timeline-shape-fill-delay))
                backwards 1;
    }

    .soh-text {
        --dir: 1;
        --angle: 30deg;
        --offset: 300px;
        font-family: 'Bebas Neue', 'BebasNeue', 'BebasNeueBold', 'Bebas', Helvetica, sans-serif;
        font-weight: 400;
        fill: var(--color-text);
        will-change: transform;
        animation: angleSlideIn var(--timeline-text-anim) var(--ease-more-circ-out)
            var(--timeline-text-delay) backwards 1;
    }
    .soh-text * {
        font-family: inherit;
    }

    .soh-text--stateof {
        letter-spacing: 0.05em;
        transform-origin: 0% 50%;
        animation-delay: calc(var(--timeline-text-delay) - var(--timeline-shape-fill-anim) * 0.25);
    }

    .soh-text--year {
        --dir: -1;
        letter-spacing: 0.1em;
        transform-origin: 100% 50%;
    }

    @keyframes angleSlideIn {
        from {
            filter: Opacity(calc(100% * var(--starting-opacity, 0)));
            opacity: var(--starting-opacity, 0);
            transform: translate(
                calc((1 - tan(var(--angle))) * 2 * var(--dir, 1) * var(--offset)),
                calc(var(--dir, 1) * var(--offset) * sin(var(--angle)))
            );
        }
    }
    @keyframes scaleIn {
        from {
            transform: scale(0.0001);
        }
    }
    @keyframes lineIn {
        from {
            stroke-dashoffset: 1;
        }
    }
    @keyframes fadeIn {
        from {
            filter: opacity(0%);
            opacity: 0;
        }
    }
    @keyframes fadeOut {
        to {
            opacity: 0;
        }
    }
    @keyframes untranslateIn {
        from {
            transform: translate(
                calc(11.28328377 / 1019.426 * 100%),
                calc(15.8194327 / 302.4304 * 100%)
            );
        }
    }
`

export default Logo
