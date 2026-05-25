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
        <div className="soc-logo__wrapper">
            <svg
                className="soc-logo"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width={748.16263}
                height={748.16263}
                viewBox="0 0 748.16263 748.16263"
            >
                <title>{'State of CSS 2025'}</title>
                <defs>
                    <mask id="soc-logo-shadow">
                        <rect x={0} y={0} width="100%" height="100%" fill="white" />
                        <polygon
                            className="soc-logo__shadow"
                            points="84.683 374.081 376.624 693.354 668.565 374.081 84.683 374.081"
                            fill="black"
                            fillRule="evenodd"
                            style={{
                                '--g': 1
                            }}
                        />
                    </mask>
                    <symbol id="soc-logo-quarter-nw">
                        <path d="M0,53.5151A56.60887,56.60887,0,0,1,53.51523,0V53.5151Z" />
                    </symbol>
                    <symbol id="soc-logo-quarter-se">
                        <path d="M53.515,0A56.60894,56.60894,0,0,1,0,53.51565V0Z" />
                    </symbol>
                    <symbol id="soc-logo-quarter-sw">
                        <path d="M53.51523,53.51565A56.609,56.609,0,0,1,0,0H53.51523Z" />
                    </symbol>
                    <symbol id="soc-logo-quarter-ne">
                        <path d="M0,0A56.60888,56.60888,0,0,1,53.51565,53.51532H0Z" />
                    </symbol>
                    <clipPath id="soc-logo-c1-tl">
                        <rect width={53.5151} height={53.5151} x={198.28919} y={317.6259} />
                    </clipPath>
                    <clipPath id="soc-logo-c1-tr">
                        <rect width={53.5151} height={53.5151} x={257.76} y={317.6259} />
                    </clipPath>
                    <clipPath id="soc-logo-c1-bl">
                        <rect width={53.5151} height={53.5151} x={198.28919} y={377.09688} />
                    </clipPath>
                    <clipPath id="soc-logo-c1-br">
                        <rect width={53.5151} height={53.5151} x={257.76} y={377.09688} />
                    </clipPath>
                    <clipPath id="soc-logo-s1-tl">
                        <rect width={53.5151} height={53.5151} x={320.17056} y={317.6259} />
                    </clipPath>
                    <clipPath id="soc-logo-s1-tr">
                        <rect width={53.5151} height={53.5151} x={379.56477} y={317.6259} />
                    </clipPath>
                    <clipPath id="soc-logo-s1-bl">
                        <rect width={53.5151} height={53.5151} x={320.17056} y={377.09688} />
                    </clipPath>
                    <clipPath id="soc-logo-s1-br">
                        <rect width={53.5151} height={53.5151} x={379.56477} y={377.09688} />
                    </clipPath>
                    <clipPath id="soc-logo-s2-tl">
                        <rect width={53.5151} height={53.5151} x={436.17146} y={317.6259} />
                    </clipPath>
                    <clipPath id="soc-logo-s2-tr">
                        <rect width={53.5151} height={53.5151} x={495.567} y={317.6259} />
                    </clipPath>
                    <clipPath id="soc-logo-s2-bl">
                        <rect width={53.5151} height={53.5151} x={436.17146} y={377.09688} />
                    </clipPath>
                    <clipPath id="soc-logo-s2-br">
                        <rect width={53.5151} height={53.5151} x={495.567} y={377.09688} />
                    </clipPath>
                    <linearGradient
                        id="grad-lines"
                        x1={41.93171}
                        y1={373.9864}
                        x2={712.54154}
                        y2={373.9864}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-grad-lines-a)" />
                        <stop offset={0.45611} stopColor="var(--color-grad-lines-b)" />
                        <stop offset={1} stopColor="var(--color-grad-lines-c)" />
                    </linearGradient>
                    <linearGradient
                        id="grad-frame-outer"
                        x1="0%"
                        y1={0}
                        x2="100%"
                        y2={0}
                        gradientUnits="objectBoundingBox"
                    >
                        <stop offset={0} stopColor="var(--color-grad-frame-a)" />
                        <stop offset={0.3333} stopColor="var(--color-grad-frame-b)" />
                        <stop offset={0.6667} stopColor="var(--color-grad-frame-c)" />
                        <stop offset={1} stopColor="var(--color-grad-frame-d)" />
                    </linearGradient>
                    <linearGradient
                        id="grad-frame-center"
                        x1="0%"
                        y1={0}
                        x2="133%"
                        y2={0}
                        xlinkHref="#grad-frame-outer"
                    />
                    <linearGradient
                        id="grad-frame-inner"
                        x1="0%"
                        y1={0}
                        x2="200%"
                        y2={0}
                        xlinkHref="#grad-frame-outer"
                    />
                    <linearGradient
                        id="grad-letter"
                        x1="0%"
                        y1={0}
                        x2="100%"
                        y2={0}
                        gradientUnits="objectBoundingBox"
                    >
                        <stop offset={0} stopColor="var(--color-grad-logo-a)" />
                        <stop offset={0.16667} stopColor="var(--color-grad-logo-b)" />
                        <stop offset={0.33333} stopColor="var(--color-grad-logo-c)" />
                        <stop offset={0.5} stopColor="var(--color-grad-logo-d)" />
                        <stop offset={0.66667} stopColor="var(--color-grad-logo-c)" />
                        <stop offset={0.83333} stopColor="var(--color-grad-logo-b)" />
                        <stop offset={1} stopColor="var(--color-grad-logo-a)" />
                    </linearGradient>
                </defs>
                <g
                    className="soc-logo__lines"
                    mask="url(#soc-logo-shadow)"
                    style={{
                        '--count': 8
                    }}
                >
                    <rect
                        x={263.49012}
                        y={95.55474}
                        width={227.49301}
                        height={14.8365}
                        fill="url(#grad-lines)"
                        style={{
                            '--i': 0
                        }}
                    />
                    <rect
                        x={204.14411}
                        y={153.41709}
                        width={346.18502}
                        height={19.782}
                        fill="url(#grad-lines)"
                        style={{
                            '--i': 1
                        }}
                    />
                    <rect
                        x={160.12916}
                        y={216.22494}
                        width={434.21492}
                        height={24.7275}
                        fill="url(#grad-lines)"
                        style={{
                            '--i': 2
                        }}
                    />
                    <rect
                        x={78.52841}
                        y={283.9783}
                        width={597.41643}
                        height={29.673}
                        fill="url(#grad-lines)"
                        style={{
                            '--i': 3
                        }}
                    />
                    <rect
                        x={41.93171}
                        y={356.67715}
                        width={670.60983}
                        height={34.6185}
                        fill="url(#grad-lines)"
                        style={{
                            '--i': 4
                        }}
                    />
                    <rect
                        x={78.52841}
                        y={434.81606}
                        width={597.91098}
                        height={28.6839}
                        fill="url(#grad-lines)"
                        style={{
                            '--i': 5
                        }}
                    />
                    <rect
                        x={160.12916}
                        y={507.02036}
                        width={434.21492}
                        height={24.7275}
                        fill="url(#grad-lines)"
                        style={{
                            '--i': 6
                        }}
                    />
                    <rect
                        x={204.14411}
                        y={574.77371}
                        width={346.18502}
                        height={19.782}
                        fill="url(#grad-lines)"
                        style={{
                            '--i': 7
                        }}
                    />
                    <rect
                        x={264.47922}
                        y={637.58156}
                        width={226.50391}
                        height={14.8365}
                        fill="url(#grad-lines)"
                        style={{
                            '--i': 8
                        }}
                    />
                </g>
                <g className="soc-logo__diamond">
                    <polygon
                        points="374.081 82.14 82.14 374.081 374.081 666.022 666.022 374.081 374.081 82.14"
                        fill="url(#grad-frame-outer)"
                        style={{
                            '--g': 0
                        }}
                    />
                    <polygon
                        points="376.624 154.721 84.683 374.081 376.624 593.442 668.565 374.081 376.624 154.721"
                        fill="url(#grad-frame-center)"
                        style={{
                            '--g': 1
                        }}
                    />
                    <polygon
                        points="376.624 228.23 84.683 374.081 376.624 519.933 668.565 374.081 376.624 228.23"
                        fill="url(#grad-frame-inner)"
                        style={{
                            '--g': 2
                        }}
                    />
                </g>
                <g className="soc-logo__stateof soc-logo__text">
                    <g
                        style={{
                            '--t': 0
                        }}
                    >
                        <text fontSize={50} textAnchor="middle" x="50%" y={57} dx={-144}>
                            {'S'}
                        </text>
                    </g>
                    <g
                        style={{
                            '--t': 1
                        }}
                    >
                        <text fontSize={50} textAnchor="middle" x="50%" y={57} dx={-100}>
                            {'T'}
                        </text>
                    </g>
                    <g
                        style={{
                            '--t': 2
                        }}
                    >
                        <text fontSize={50} textAnchor="middle" x="50%" y={57} dx={-57}>
                            {'A'}
                        </text>
                    </g>
                    <g
                        style={{
                            '--t': 3
                        }}
                    >
                        <text fontSize={50} textAnchor="middle" x="50%" y={57} dx={-14}>
                            {'T'}
                        </text>
                    </g>
                    <g
                        style={{
                            '--t': 4
                        }}
                    >
                        <text fontSize={50} textAnchor="middle" x="50%" y={57} dx={30}>
                            {'E'}
                        </text>
                    </g>
                    <g
                        style={{
                            '--t': 5
                        }}
                    >
                        <text fontSize={50} textAnchor="middle" x="50%" y={57} dx={109}>
                            {'O'}
                        </text>
                    </g>
                    <g
                        style={{
                            '--t': 6
                        }}
                    >
                        <text fontSize={50} textAnchor="middle" x="50%" y={57} dx={152}>
                            {'F'}
                        </text>
                    </g>
                </g>
                <g className="soc-logo__css">
                    <g
                        style={{
                            '--g': 1
                        }}
                    >
                        <g
                            clipPath="url(#soc-logo-c1-tl)"
                            style={{
                                '--a': '-270deg',
                                '--i': 1
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="nw"
                            >
                                <use xlinkHref="#soc-logo-quarter-nw" x={198.28919} y={317.6259} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="nw"
                            >
                                <use xlinkHref="#soc-logo-quarter-nw" x={198.28919} y={317.6259} />
                            </g>
                        </g>
                        <g
                            clipPath="url(#soc-logo-c1-tr)"
                            style={{
                                '--a': '120deg',
                                '--i': 2
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="se"
                            >
                                <use xlinkHref="#soc-logo-quarter-se" x={257.76} y={317.6259} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="se"
                            >
                                <use xlinkHref="#soc-logo-quarter-se" x={257.76} y={317.6259} />
                            </g>
                        </g>
                        <g
                            clipPath="url(#soc-logo-c1-bl)"
                            style={{
                                '--a': '150deg',
                                '--i': 3
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="sw"
                            >
                                <use xlinkHref="#soc-logo-quarter-sw" x={198.28919} y={377.09688} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="sw"
                            >
                                <use xlinkHref="#soc-logo-quarter-sw" x={198.28919} y={377.09688} />
                            </g>
                        </g>
                        <g
                            clipPath="url(#soc-logo-c1-br)"
                            style={{
                                '--a': '270deg',
                                '--i': 4
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="ne"
                            >
                                <use xlinkHref="#soc-logo-quarter-ne" x={257.76} y={377.09688} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="ne"
                            >
                                <use xlinkHref="#soc-logo-quarter-ne" x={257.76} y={377.09688} />
                            </g>
                        </g>
                    </g>
                    <g
                        style={{
                            '--g': 2
                        }}
                    >
                        <g
                            clipPath="url(#soc-logo-s1-tl)"
                            style={{
                                '--a': '-270deg',
                                '--i': 1
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="nw"
                            >
                                <use xlinkHref="#soc-logo-quarter-nw" x={320.17056} y={317.6259} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="nw"
                            >
                                <use xlinkHref="#soc-logo-quarter-nw" x={320.17056} y={317.6259} />
                            </g>
                        </g>
                        <g
                            clipPath="url(#soc-logo-s1-tr)"
                            style={{
                                '--a': '120deg',
                                '--i': 2
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="se"
                            >
                                <use xlinkHref="#soc-logo-quarter-se" x={379.56477} y={317.6259} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="se"
                            >
                                <use xlinkHref="#soc-logo-quarter-se" x={379.56477} y={317.6259} />
                            </g>
                        </g>
                        <g
                            clipPath="url(#soc-logo-s1-bl)"
                            style={{
                                '--a': '-120deg',
                                '--i': 3
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="nw"
                            >
                                <use xlinkHref="#soc-logo-quarter-nw" x={320.17056} y={377.09688} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="nw"
                            >
                                <use xlinkHref="#soc-logo-quarter-nw" x={320.17056} y={377.09688} />
                            </g>
                        </g>
                        <g
                            clipPath="url(#soc-logo-s1-br)"
                            style={{
                                '--a': '270deg',
                                '--i': 4
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="se"
                            >
                                <use xlinkHref="#soc-logo-quarter-se" x={379.56477} y={377.09688} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="se"
                            >
                                <use xlinkHref="#soc-logo-quarter-se" x={379.56477} y={377.09688} />
                            </g>
                        </g>
                    </g>
                    <g
                        style={{
                            '--g': 3
                        }}
                    >
                        <g
                            clipPath="url(#soc-logo-s2-tl)"
                            style={{
                                '--a': '-135deg',
                                '--i': 1
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="nw"
                            >
                                <use xlinkHref="#soc-logo-quarter-nw" x={436.17146} y={317.6259} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="nw"
                            >
                                <use xlinkHref="#soc-logo-quarter-nw" x={436.17146} y={317.6259} />
                            </g>
                        </g>
                        <g
                            clipPath="url(#soc-logo-s2-tr)"
                            style={{
                                '--a': '270deg',
                                '--i': 2
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="se"
                            >
                                <use xlinkHref="#soc-logo-quarter-se" x={495.567} y={317.6259} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="se"
                            >
                                <use xlinkHref="#soc-logo-quarter-se" x={495.567} y={317.6259} />
                            </g>
                        </g>
                        <g
                            clipPath="url(#soc-logo-s2-bl)"
                            style={{
                                '--a': '180deg',
                                '--i': 3
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="nw"
                            >
                                <use xlinkHref="#soc-logo-quarter-nw" x={436.17146} y={377.09688} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="nw"
                            >
                                <use xlinkHref="#soc-logo-quarter-nw" x={436.17146} y={377.09688} />
                            </g>
                        </g>
                        <g
                            clipPath="url(#soc-logo-s2-br)"
                            style={{
                                '--a': '-180deg',
                                '--i': 4
                            }}
                        >
                            <g
                                className="soc-logo__quarter soc-logo__quarter--ghost"
                                data-curve="se"
                            >
                                <use xlinkHref="#soc-logo-quarter-se" x={495.567} y={377.09688} />
                            </g>
                            <g
                                className="soc-logo__quarter soc-logo__quarter--grad"
                                data-curve="se"
                            >
                                <use xlinkHref="#soc-logo-quarter-se" x={495.567} y={377.09688} />
                            </g>
                        </g>
                    </g>
                </g>
                <g className="soc-logo__year soc-logo__text">
                    <g
                        style={{
                            '--t': 0
                        }}
                    >
                        <text
                            fontSize={50}
                            textAnchor="middle"
                            x="50%"
                            y={722}
                            dx={-63}
                            data-year-char={1}
                        >
                            {'2'}
                        </text>
                    </g>
                    <g
                        style={{
                            '--t': 1
                        }}
                    >
                        <text
                            fontSize={50}
                            textAnchor="middle"
                            x="50%"
                            y={722}
                            dx={-18}
                            data-year-char={2}
                        >
                            {'0'}
                        </text>
                    </g>
                    <g
                        style={{
                            '--t': 2
                        }}
                    >
                        <text
                            fontSize={50}
                            textAnchor="middle"
                            x="50%"
                            y={722}
                            dx={27}
                            data-year-char={3}
                        >
                            {'2'}
                        </text>
                    </g>
                    <g
                        style={{
                            '--t': 3
                        }}
                    >
                        <text
                            fontSize={50}
                            textAnchor="middle"
                            x="50%"
                            y={722}
                            dx={71}
                            data-year-char={4}
                        >
                            {'5'}
                        </text>
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

    .soc-logo__wrapper {
        --color-bg: #232840;
        --color-text: #fff6e6;
        --color-accent: #ffffff;
        --color-alt: #ede1a4;
        --color-grad-lines-a: #68d1d5;
        --color-grad-lines-b: #3797c0;
        --color-grad-lines-c: #59258a;
        --color-grad-frame-a: #ebc4ed;
        --color-grad-frame-b: #943c9a;
        --color-grad-frame-c: #800e86;
        --color-grad-frame-d: #59258a;
        --color-grad-logo-a: #bbb2a4;
        --color-grad-logo-b: #ded5c6;
        --color-grad-logo-c: #f1e8d8;
        --color-grad-logo-d: #f6edde;
        --color-shadow-logo: #7a2380;
        --timeline-delay-frame: 500ms;
        --timeline-anim-frame: 1250ms;
        --timeline-anim-text: 500ms;
        --timeline-delay-text: 50ms;
        --timeline-anim-letters: 2500ms;
        --timeline-delay-letters: 50ms;
        --ease-bouncy-out: cubic-bezier(0.6, 1.5, 0.5, 1);
        --ease-bouncy-in-out: cubic-bezier(0.25, -0.25, 0.1, 1.25);
        background: none;
    }

    .soc-logo * {
        transform-box: fill-box;
        transform-origin: 50% 50%;
    }

    .soc-logo {
        width: 100%;
        height: auto;
    }
    .soc-logo__wrapper {
        position: relative;
        display: grid;
        width: 100vmin;
        max-width: 500px;
        aspect-ratio: 1;
        margin: auto;
        background: none;
    }
    .soc-logo__lines > * {
        --line-delay: calc((var(--i) - var(--count) / 2) / var(--count));
        animation: scaleXIn var(--timeline-anim-frame) var(--ease-bouncy-out, ease) 1 backwards;
        animation-delay: calc(
            Max(var(--line-delay), var(--line-delay) * -1) * var(--timeline-anim-frame) / 2
        );
    }
    .soc-logo__diamond > *,
    .soc-logo__shadow {
        animation: scaleIn var(--timeline-anim-frame) var(--ease-bouncy-out, ease) 1 backwards;
        animation-delay: calc(
            var(--timeline-delay-frame) + (var(--g)) * var(--timeline-anim-frame) / 4
        );
    }
    .soc-logo__shadow {
        transform-box: view-box;
    }
    .soc-logo__frame {
        position: absolute;
        inset: 0;
        width: 100%;
        height: auto;
        overflow: visible !important;
    }
    .soc-logo__frame path {
        stroke: var(--color-accent, hotpink);
        stroke-dasharray: 100;
        stroke-dashoffset: 0;
        animation: pathIn var(--timeline-anim-frame) cubic-bezier(0.5, 0, 0.5, 1) 1 backwards;
    }
    .soc-logo__text > * {
        --text-delay: calc(
            var(--timeline-local-delay) + var(--t, 0) * var(--timeline-delay-text, 20ms)
        );
        font-family: 'Bebas Neue', 'BebasNeue', 'BebasNeueBold', 'Bebas', Helvetica, sans-serif;
        font-weight: 400;
        fill: var(--color-text);
        animation: textIn var(--timeline-anim-text) var(--ease-bouncy-out) var(--text-delay) 1
                backwards,
            fadeIn var(--timeline-anim-text) ease-out var(--text-delay) 1 backwards;
    }
    .soc-logo__text > * * {
        font-family: inherit;
    }
    .soc-logo__stateof {
        --timeline-local-delay: calc(var(--timeline-anim-frame) * 0.5);
        letter-spacing: 0.17em;
    }
    .soc-logo__css {
        --timeline-local-delay: calc(var(--timeline-anim-frame) * 0.75);
        filter: drop-shadow(0 10px 30px var(--color-shadow-logo));
    }
    .soc-logo__quarter {
        --anim-quarter-delay: calc(
            var(--timeline-delay-letters, 20ms) * var(--g) * var(--i) + var(--timeline-local-delay) -
                50ms
        );
        animation: clockIn var(--timeline-anim-letters) cubic-bezier(0, 0, 0, 1) 1 backwards;
        will-change: transform;
    }
    .soc-logo__quarter--grad {
        fill: url(#grad-letter);
        animation-delay: calc(var(--anim-quarter-delay) + 300ms);
    }
    .soc-logo__quarter--ghost {
        fill: var(--color-bg, black);
        animation-delay: var(--anim-quarter-delay);
    }
    .soc-logo__quarter[data-curve='nw'] {
        transform-origin: 100% 100%;
    }
    .soc-logo__quarter[data-curve='ne'] {
        transform-origin: 0 100%;
    }
    .soc-logo__quarter[data-curve='se'] {
        transform-origin: 0 0;
    }
    .soc-logo__quarter[data-curve='sw'] {
        transform-origin: 100% 0;
    }
    .soc-logo__year {
        --timeline-local-delay: calc(
            var(--timeline-anim-frame) * 0.75 + var(--timeline-anim-letters)
        );
        letter-spacing: 0.6em;
    }

    @keyframes scaleXIn {
        from {
            transform: scaleX(0);
        }
    }
    @keyframes scaleIn {
        from {
            transform: scaleY(0) scaleX(0.6667);
        }
    }
    @keyframes pathIn {
        from {
            stroke-dashoffset: 100;
        }
    }
    @keyframes textIn {
        from {
            transform: translateY(100%) rotate(10deg);
        }
    }
    @keyframes fadeIn {
        from {
            fill-opacity: 0;
        }
    }
    @keyframes clockIn {
        from {
            transform: rotate(var(--a, 30deg));
            fill-opacity: 0;
        }
        0.1% {
            fill-opacity: 1;
        }
    }
`

export default Logo
