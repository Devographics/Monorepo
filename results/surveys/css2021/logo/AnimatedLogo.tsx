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
    <Wrapper aria-label="State of CSS 2021" className="soc-logo__wrapper">
        <SOCLogo
            className="soc-logo"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width={748.163}
            height={748.163}
            viewBox="0 0 748.163 748.163"
        >
            <defs>
                <mask id="soc-logo-shadow">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    <polygon
                        className="soc-logo__shadow"
                        points="84.683 374.081 376.624 693.354 668.565 374.081 84.683 374.081"
                        fill="black"
                        fillRule="evenodd"
                        style={{ '--g': '1' } as React.CSSProperties}
                    />
                </mask>

                <mask id="soc-logo-css">
                    <rect x="0" y="0" width="100%" height="100%" fill="black" />
                    <path
                        d="M320.17056,371.141a56.60842,56.60842,0,0,1,53.515-53.5151V371.141Z"
                        fill="white"
                    />
                    <path
                        d="M379.56477,317.55174h53.51566a56.60868,56.60868,0,0,1-53.51533,53.515Z"
                        fill="white"
                    />
                    <path
                        d="M320.17056,430.6122a56.60829,56.60829,0,0,1,53.515-53.51532V430.6122Z"
                        fill="white"
                    />
                    <path
                        d="M379.56477,377.02194h53.51566a56.60915,56.60915,0,0,1-53.51533,53.51565Z"
                        fill="white"
                    />
                    <path
                        d="M436.17146,371.141a56.60892,56.60892,0,0,1,53.515-53.5151l.00035,53.5151Z"
                        fill="white"
                    />
                    <path
                        d="M495.567,317.55174h53.51566a56.61,56.61,0,0,1-53.51566,53.515Z"
                        fill="white"
                    />
                    <path
                        d="M436.17146,430.6122a56.60879,56.60879,0,0,1,53.515-53.51532l.00035,53.51532Z"
                        fill="white"
                    />
                    <path
                        d="M495.567,377.02194h53.51566A56.6105,56.6105,0,0,1,495.567,430.53759Z"
                        fill="white"
                    />
                    <path
                        d="M198.28919,371.141a56.60888,56.60888,0,0,1,53.51523-53.5151V371.141Z"
                        fill="white"
                    />
                    <path
                        d="M311.27493,317.55042a56.609,56.609,0,0,1-53.515,53.51566V317.55043Z"
                        fill="white"
                    />
                    <path
                        d="M251.80442,430.53759a56.609,56.609,0,0,1-53.51523-53.51565h53.51523Z"
                        fill="white"
                    />
                    <path
                        d="M257.75994,377.09688A56.6089,56.6089,0,0,1,311.2756,430.6122H257.75994Z"
                        fill="white"
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

                {/* <!-- C --> */}
                <clipPath id="soc-logo-c1-tl">
                    <rect width="53.5151" height="53.5151" x="198.28919" y="317.6259" />
                </clipPath>
                <clipPath id="soc-logo-c1-tr">
                    <rect width="53.5151" height="53.5151" x="257.76" y="317.6259" />
                </clipPath>
                <clipPath id="soc-logo-c1-bl">
                    <rect width="53.5151" height="53.5151" x="198.28919" y="377.09688" />
                </clipPath>
                <clipPath id="soc-logo-c1-br">
                    <rect width="53.5151" height="53.5151" x="257.76" y="377.09688" />
                </clipPath>

                {/* <!-- S1 --> */}
                <clipPath id="soc-logo-s1-tl">
                    <rect width="53.5151" height="53.5151" x="320.17056" y="317.6259" />
                </clipPath>
                <clipPath id="soc-logo-s1-tr">
                    <rect width="53.5151" height="53.5151" x="379.56477" y="317.6259" />
                </clipPath>
                <clipPath id="soc-logo-s1-bl">
                    <rect width="53.5151" height="53.5151" x="320.17056" y="377.09688" />
                </clipPath>
                <clipPath id="soc-logo-s1-br">
                    <rect width="53.5151" height="53.5151" x="379.56477" y="377.09688" />
                </clipPath>

                {/* <!-- S2 --> */}
                <clipPath id="soc-logo-s2-tl">
                    <rect width="53.5151" height="53.5151" x="436.17146" y="317.6259" />
                </clipPath>
                <clipPath id="soc-logo-s2-tr">
                    <rect width="53.5151" height="53.5151" x="495.567" y="317.6259" />
                </clipPath>
                <clipPath id="soc-logo-s2-bl">
                    <rect width="53.5151" height="53.5151" x="436.17146" y="377.09688" />
                </clipPath>
                <clipPath id="soc-logo-s2-br">
                    <rect width="53.5151" height="53.5151" x="495.567" y="377.09688" />
                </clipPath>

                <linearGradient
                    id="grad-lines"
                    x1="41.93171"
                    y1="373.9864"
                    x2="712.54154"
                    y2="373.9864"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#9f0d63" />
                    <stop offset="0.45611" stopColor="#6214ad" />
                    <stop offset="1" stopColor="#1734bf" />
                </linearGradient>

                <linearGradient
                    id="grad-frame-outer"
                    x1="0%"
                    y1="0"
                    x2="100%"
                    y2="0"
                    gradientUnits="objectBoundingBox"
                >
                    <stop offset="0" stopColor="#e2eea3" />
                    <stop offset="0.3333" stopColor="#ea1c78" />
                    <stop offset="0.6667" stopColor="#9f0d63" />
                    <stop offset="1" stopColor="#41092e" />
                </linearGradient>

                <linearGradient
                    id="grad-frame-center"
                    x1="0%"
                    y1="0"
                    x2="133%"
                    y2="0"
                    xlinkHref="#grad-frame-outer"
                />

                <linearGradient
                    id="grad-frame-inner"
                    x1="0%"
                    y1="0"
                    x2="200%"
                    y2="0"
                    xlinkHref="#grad-frame-outer"
                />

                <linearGradient
                    id="grad-letter"
                    x1="0%"
                    y1="0"
                    x2="100%"
                    y2="0"
                    gradientUnits="objectBoundingBox"
                >
                    <stop offset="0" stopColor="#bbb2a4" />
                    <stop offset="0.16667" stopColor="#ded5c6" />
                    <stop offset="0.33333" stopColor="#f1e8d8" />
                    <stop offset="0.5" stopColor="#f6edde" />
                    <stop offset="0.66667" stopColor="#f1e8d8" />
                    <stop offset="0.83333" stopColor="#ded5c6" />
                    <stop offset="1" stopColor="#bbb2a4" />
                </linearGradient>
            </defs>

            <g
                className="soc-logo__lines"
                mask="url(#soc-logo-shadow)"
                style={{ '--count': '8' } as React.CSSProperties}
            >
                <rect
                    x="263.49012"
                    y="95.55474"
                    width="227.49301"
                    height="14.8365"
                    fill="url(#grad-lines)"
                    style={{ '--i': '0' } as React.CSSProperties}
                />
                <rect
                    x="204.14411"
                    y="153.41709"
                    width="346.18502"
                    height="19.782"
                    fill="url(#grad-lines)"
                    style={{ '--i': '1' } as React.CSSProperties}
                />
                <rect
                    x="160.12916"
                    y="216.22494"
                    width="434.21492"
                    height="24.7275"
                    fill="url(#grad-lines)"
                    style={{ '--i': '2' } as React.CSSProperties}
                />
                <rect
                    x="78.52841"
                    y="283.9783"
                    width="597.41643"
                    height="29.673"
                    fill="url(#grad-lines)"
                    style={{ '--i': '3' } as React.CSSProperties}
                />
                <rect
                    x="41.93171"
                    y="356.67715"
                    width="670.60983"
                    height="34.6185"
                    fill="url(#grad-lines)"
                    style={{ '--i': '4' } as React.CSSProperties}
                />
                <rect
                    x="78.52841"
                    y="434.81606"
                    width="597.91098"
                    height="28.6839"
                    fill="url(#grad-lines)"
                    style={{ '--i': '5' } as React.CSSProperties}
                />
                <rect
                    x="160.12916"
                    y="507.02036"
                    width="434.21492"
                    height="24.7275"
                    fill="url(#grad-lines)"
                    style={{ '--i': '6' } as React.CSSProperties}
                />
                <rect
                    x="204.14411"
                    y="574.77371"
                    width="346.18502"
                    height="19.782"
                    fill="url(#grad-lines)"
                    style={{ '--i': '7' } as React.CSSProperties}
                />
                <rect
                    x="264.47922"
                    y="637.58156"
                    width="226.50391"
                    height="14.8365"
                    fill="url(#grad-lines)"
                    style={{ '--i': '8' } as React.CSSProperties}
                />
            </g>

            <g className="soc-logo__diamond">
                <polygon
                    points="374.081 82.14 82.14 374.081 374.081 666.022 666.022 374.081 374.081 82.14"
                    fill="url(#grad-frame-outer)"
                    style={{ '--g': '0' } as React.CSSProperties}
                />
                <polygon
                    points="376.624 154.721 84.683 374.081 376.624 593.442 668.565 374.081 376.624 154.721"
                    fill="url(#grad-frame-center)"
                    style={{ '--g': '1' } as React.CSSProperties}
                />
                <polygon
                    points="376.624 228.23 84.683 374.081 376.624 519.933 668.565 374.081 376.624 228.23"
                    fill="url(#grad-frame-inner)"
                    style={{ '--g': '2' } as React.CSSProperties}
                />
            </g>

            <g className="soc-logo__stateof soc-logo__text">
                <path
                    d="M228.964,20.64932c5.457,0,8.26172,3.26367,8.26172,8.97558V30.746H231.922V29.26748c0-2.5498-1.01953-3.51855-2.80469-3.51855s-2.80469.96875-2.80469,3.51855c0,7.34375,10.96387,8.72071,10.96387,18.919,0,5.71191-2.85547,8.97558-8.36328,8.97558-5.50684,0-8.36328-3.26367-8.36328-8.97558V45.994h5.30371v2.54981c0,2.5498,1.12207,3.46777,2.90722,3.46777,1.78418,0,2.90625-.918,2.90625-3.46777,0-7.34375-10.96386-8.7207-10.96386-18.91895C220.70324,23.913,223.50792,20.64932,228.964,20.64932Z"
                    style={{ '--t': '0' } as React.CSSProperties}
                />
                <path
                    d="M264.49718,21.05752h17.33789v5.09961h-5.86426V56.75381h-5.60937V26.15713h-5.86426Z"
                    style={{ '--t': '1' } as React.CSSProperties}
                />
                <path
                    d="M326.00988,56.75381h-5.66016l-.96875-6.47656h-6.88476l-.96875,6.47656h-5.1504L312.089,21.05752h8.21ZM313.21007,45.43252h5.40625L315.9132,27.38076Z"
                    style={{ '--t': '2' } as React.CSSProperties}
                />
                <path
                    d="M350.55382,21.05752h17.33789v5.09961h-5.86425V56.75381h-5.60938V26.15713h-5.86426Z"
                    style={{ '--t': '3' } as React.CSSProperties}
                />
                <path
                    d="M401.28722,36.10049h7.7002V41.2001h-7.7002V51.6542h9.68848v5.09961H395.67785V21.05752H410.9757v5.09961h-9.68848Z"
                    style={{ '--t': '4' } as React.CSSProperties}
                />
                <path
                    d="M472.89171,29.6249c0-5.71191,3.00782-8.97558,8.51563-8.97558s8.5166,3.26367,8.5166,8.97558V48.18643c0,5.71191-3.00879,8.97558-8.5166,8.97558s-8.51563-3.26367-8.51563-8.97558Zm5.60938,18.919c0,2.5498,1.12109,3.51855,2.90625,3.51855s2.90722-.96875,2.90722-3.51855V29.26748c0-2.5498-1.12207-3.51855-2.90722-3.51855s-2.90625.96875-2.90625,3.51855Z"
                    style={{ '--t': '5' } as React.CSSProperties}
                />
                <path
                    d="M523.97667,36.9169h7.24121v5.09961h-7.24121v14.7373H518.3673V21.05752h14.83984v5.09961h-9.23047Z"
                    style={{ '--t': '6' } as React.CSSProperties}
                />
            </g>

            <g className="soc-logo__css">
                {/* <!-- C --> */}
                <g style={{ '--g': '1' } as React.CSSProperties}>
                    <g
                        clipPath="url(#soc-logo-c1-tl)"
                        style={{ '--a': '-270deg', '--i': ' 1' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="nw">
                            <use xlinkHref="#soc-logo-quarter-nw" x="198.28919" y="317.6259" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="nw">
                            <use xlinkHref="#soc-logo-quarter-nw" x="198.28919" y="317.6259" />
                        </g>
                    </g>
                    <g
                        clipPath="url(#soc-logo-c1-tr)"
                        style={{ '--a': '120deg', '--i': ' 2' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="se">
                            <use xlinkHref="#soc-logo-quarter-se" x="257.76" y="317.6259" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="se">
                            <use xlinkHref="#soc-logo-quarter-se" x="257.76" y="317.6259" />
                        </g>
                    </g>
                    <g
                        clipPath="url(#soc-logo-c1-bl)"
                        style={{ '--a': '150deg', '--i': ' 3' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="sw">
                            <use xlinkHref="#soc-logo-quarter-sw" x="198.28919" y="377.09688" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="sw">
                            <use xlinkHref="#soc-logo-quarter-sw" x="198.28919" y="377.09688" />
                        </g>
                    </g>
                    <g
                        clipPath="url(#soc-logo-c1-br)"
                        style={{ '--a': '270deg', '--i': ' 4' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="ne">
                            <use xlinkHref="#soc-logo-quarter-ne" x="257.76" y="377.09688" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="ne">
                            <use xlinkHref="#soc-logo-quarter-ne" x="257.76" y="377.09688" />
                        </g>
                    </g>
                </g>

                {/* <!-- S1 --> */}
                <g style={{ '--g': '2' } as React.CSSProperties}>
                    <g
                        clipPath="url(#soc-logo-s1-tl)"
                        style={{ '--a': '-270deg', '--i': ' 1' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="nw">
                            <use xlinkHref="#soc-logo-quarter-nw" x="320.17056" y="317.6259" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="nw">
                            <use xlinkHref="#soc-logo-quarter-nw" x="320.17056" y="317.6259" />
                        </g>
                    </g>
                    <g
                        clipPath="url(#soc-logo-s1-tr)"
                        style={{ '--a': '120deg', '--i': ' 2' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="se">
                            <use xlinkHref="#soc-logo-quarter-se" x="379.56477" y="317.6259" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="se">
                            <use xlinkHref="#soc-logo-quarter-se" x="379.56477" y="317.6259" />
                        </g>
                    </g>
                    <g
                        clipPath="url(#soc-logo-s1-bl)"
                        style={{ '--a': '-120deg', '--i': ' 3' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="nw">
                            <use xlinkHref="#soc-logo-quarter-nw" x="320.17056" y="377.09688" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="nw">
                            <use xlinkHref="#soc-logo-quarter-nw" x="320.17056" y="377.09688" />
                        </g>
                    </g>
                    <g
                        clipPath="url(#soc-logo-s1-br)"
                        style={{ '--a': '135deg', '--i': ' 4' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="se">
                            <use xlinkHref="#soc-logo-quarter-se" x="379.56477" y="377.09688" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="se">
                            <use xlinkHref="#soc-logo-quarter-se" x="379.56477" y="377.09688" />
                        </g>
                    </g>
                </g>

                {/* <!-- S2 --> */}
                <g style={{ '--g': '3' } as React.CSSProperties}>
                    <g
                        clipPath="url(#soc-logo-s2-tl)"
                        style={{ '--a': '-135deg', '--i': ' 1' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="nw">
                            <use xlinkHref="#soc-logo-quarter-nw" x="436.17146" y="317.6259" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="nw">
                            <use xlinkHref="#soc-logo-quarter-nw" x="436.17146" y="317.6259" />
                        </g>
                    </g>
                    <g
                        clipPath="url(#soc-logo-s2-tr)"
                        style={{ '--a': '270deg', '--i': ' 2' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="se">
                            <use xlinkHref="#soc-logo-quarter-se" x="495.567" y="317.6259" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="se">
                            <use xlinkHref="#soc-logo-quarter-se" x="495.567" y="317.6259" />
                        </g>
                    </g>
                    <g
                        clipPath="url(#soc-logo-s2-bl)"
                        style={{ '--a': '180deg', '--i': ' 3' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="nw">
                            <use xlinkHref="#soc-logo-quarter-nw" x="436.17146" y="377.09688" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="nw">
                            <use xlinkHref="#soc-logo-quarter-nw" x="436.17146" y="377.09688" />
                        </g>
                    </g>
                    <g
                        clipPath="url(#soc-logo-s2-br)"
                        style={{ '--a': '-180deg', '--i': ' 4' } as React.CSSProperties}
                    >
                        <g className="soc-logo__quarter soc-logo__quarter--ghost" data-curve="se">
                            <use xlinkHref="#soc-logo-quarter-se" x="495.567" y="377.09688" />
                        </g>
                        <g className="soc-logo__quarter soc-logo__quarter--grad" data-curve="se">
                            <use xlinkHref="#soc-logo-quarter-se" x="495.567" y="377.09688" />
                        </g>
                    </g>
                </g>
            </g>

            <g className="soc-logo__year soc-logo__text">
                <path
                    d="M310.13,691.04287c-1.78515,0-2.90722.96875-2.90722,3.51856v3.82422H301.92v-3.4668c0-5.71191,2.85547-8.97559,8.36231-8.97559,5.50781,0,8.36328,3.26368,8.36328,8.97559,0,11.21875-11.168,15.40039-11.168,21.26465a3.801,3.801,0,0,0,.05176.76465h10.60644v5.09961H301.92V717.662c0-10.50488,11.11621-12.23828,11.11621-22.54C313.03624,691.91006,311.91417,691.04287,310.13,691.04287Z"
                    style={{ '--t': '0' } as React.CSSProperties}
                />
                <path
                    d="M346.69738,694.91885c0-5.71191,3.00879-8.97559,8.5166-8.97559,5.50683,0,8.51562,3.26368,8.51562,8.97559v18.56152c0,5.71192-3.00879,8.97559-8.51562,8.97559-5.50781,0-8.5166-3.26367-8.5166-8.97559Zm5.60937,18.91894c0,2.54981,1.12207,3.51856,2.90723,3.51856,1.78418,0,2.90625-.96875,2.90625-3.51856V694.56143c0-2.54981-1.12207-3.51856-2.90625-3.51856-1.78516,0-2.90723.96875-2.90723,3.51856Z"
                    style={{ '--t': '1' } as React.CSSProperties}
                />
                <path
                    d="M400.27648,691.04287c-1.78418,0-2.90625.96875-2.90625,3.51856v3.82422h-5.30371v-3.4668c0-5.71191,2.85547-8.97559,8.36328-8.97559s8.36328,3.26368,8.36328,8.97559c0,11.21875-11.168,15.40039-11.168,21.26465a3.873,3.873,0,0,0,.05078.76465h10.60742v5.09961H392.06652V717.662c0-10.50488,11.11719-12.23828,11.11719-22.54C403.18371,691.91006,402.06163,691.04287,400.27648,691.04287Z"
                    style={{ '--t': '2' } as React.CSSProperties}
                />
                <path
                    d="M438.6798,690.83877c4.335,0,5.30371-2.09082,6.1709-4.4873h3.77343v35.69629h-5.60937V694.81631h-4.335Z"
                    style={{ '--t': '3' } as React.CSSProperties}
                />
            </g>
        </SOCLogo>
    </Wrapper>
)

const scaleXIn = keyframes`
  from {
      transform: scaleX(0);
  }
`

const scaleIn = keyframes`
  from {
      transform: scaleY(0) scaleX(0.6667);
  }
`

const pathIn = keyframes`
  from {
      stroke-dashoffset: 100;
  }
`

const textIn = keyframes`
  from {
      transform: translateY(100%);
  }
`

const fadeIn = keyframes`
  from {
      fill-opacity: 0;
  }
`

const clockIn = keyframes`
  from {
      transform: rotate(var(--a, 30deg));
      fill-opacity: 0;
  }
  0.1% {
      fill-opacity: 1;
  }
`

const Wrapper = styled.div`
    margin: 0 auto;
    margin-bottom: ${spacing(3)};
    max-width: 400px;
    width: 100%;
    img {
        display: block;
        width: 100%;
    }

    .soc-logo * {
        transform-box: fill-box;
        transform-origin: 50% 50%;
    }

    [hidden] {
        display: none !important;
    }
`

const SOCLogo = styled.svg`
    --color-bg: #232840;
    --color-text: #fff6e6; // #9AC6C9;
    --color-accent: #f649a7;
    --color-alt: #ede1a4;

    --timeline-delay-frame: 500ms;
    --timeline-anim-frame: 1250ms;
    --timeline-anim-text: 500ms;
    --timeline-delay-text: 50ms;
    --timeline-anim-letters: 2500ms;
    --timeline-delay-letters: 50ms;

    --ease-bouncy-out: cubic-bezier(0.6, 1.5, 0.5, 1);
    --ease-bouncy-in-out: cubic-bezier(0.25, -0.25, 0.1, 1.25);

    width: 100%;
    height: auto;

    .soc-logo__wrapper {
        position: relative;
        display: grid;

        width: 100%;
        max-width: 600px;
        aspect-ratio: 1;
        margin: auto;

        background: var(--color-bg, navy);
    }

    .soc-logo__lines > * {
        --line-delay: calc((var(--i) - var(--count) / 2) / var(--count));

        animation: ${scaleXIn} var(--timeline-anim-frame) var(--ease-bouncy-out, ease) 1 backwards;
        animation-delay: calc(
            Max(var(--line-delay), var(--line-delay) * -1) * var(--timeline-anim-frame) / 2
        );
    }

    .soc-logo__diamond > *,
    .soc-logo__shadow {
        animation: ${scaleIn} var(--timeline-anim-frame) var(--ease-bouncy-out, ease) 1 backwards;
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

        path {
            stroke: var(--color-accent, hotpink);
            stroke-dasharray: 100;
            stroke-dashoffset: 0;

            animation: ${pathIn} var(--timeline-anim-frame) cubic-bezier(0.5, 0, 0.5, 1) 1 backwards;
        }
    }

    .soc-logo__text > * {
        --text-delay: calc(
            var(--timeline-local-delay) + var(--t, 0) * var(--timeline-delay-text, 20ms)
        );

        fill: var(--color-text);

        animation: ${textIn} var(--timeline-anim-text) var(--ease-bouncy-out) var(--text-delay) 1
                backwards,
            ${fadeIn} var(--timeline-anim-text) ease-out var(--text-delay) 1 backwards;
    }

    .soc-logo__stateof {
        --timeline-local-delay: calc(var(--timeline-anim-frame) * 0.5);
    }

    .soc-logo__css {
        --timeline-local-delay: calc(var(--timeline-anim-frame) * 0.75);

        filter: drop-shadow(0 10px 30px #c61270);
    }

    .soc-logo__quarter {
        --anim-quarter-delay: calc(
            var(--timeline-delay-letters, 20ms) * var(--g) * var(--i) + var(--timeline-local-delay) -
                50ms
        );

        animation: ${clockIn} var(--timeline-anim-letters) cubic-bezier(0, 0, 0, 1) 1 backwards;
        will-change: transform;

        &[data-curve='nw'] {
            transform-origin: 100% 100%;
        }

        &[data-curve='ne'] {
            transform-origin: 0 100%;
        }

        &[data-curve='se'] {
            transform-origin: 0 0;
        }

        &[data-curve='sw'] {
            transform-origin: 100% 0;
        }
    }

    .soc-logo__quarter--grad {
        fill: url(#grad-letter);

        animation-delay: calc(var(--anim-quarter-delay) + 300ms);
    }

    .soc-logo__quarter--ghost {
        fill: var(--color-bg, black);

        animation-delay: var(--anim-quarter-delay);
    }

    .soc-logo__year {
        --timeline-local-delay: calc(
            var(--timeline-anim-frame) * 0.75 + var(--timeline-anim-letters)
        );
    }
`

export default Logo
