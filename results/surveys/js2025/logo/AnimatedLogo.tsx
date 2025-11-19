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
    <Wrapper aria-label="State of JS 2025" className="logo__wrapper">
        <div className="soj-logo__wrapper">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width={1620}
                height={740}
                viewBox="0 0 1620 740"
                className="soj-logo"
            >
                <title>{'State of JS 2025'}</title>
                <defs>
                    <symbol id="soj-shape-js">
                        <path
                            data-name="JS Logo"
                            d="M661.932,201.87l7.2496-27.05542H808.923L738.855,435.09858H576.9782a83.22157,83.22157,0,0,1-11.04936-27.05542H718.08735L773.58926,201.87ZM800.404,565.18547a51.62455,51.62455,0,0,0,49.76744-38.14219l49.91992-185.12745a31.71222,31.71222,0,0,1,30.57311-23.43176h87.556l7.24954-27.05542H925.13136a51.62324,51.62324,0,0,0-49.76743,38.1417L825.44352,514.69877a31.71263,31.71263,0,0,1-30.57263,23.43128H668.03941l-7.2496,27.05542Zm38.85355-251.02323L789.33734,499.29065H678.44646l-8.302,30.9831H794.87089A23.84432,23.84432,0,0,0,817.85766,512.657l49.92041-185.1289a59.49125,59.49125,0,0,1,57.35329-43.95576h102.44376l8.302-30.9831H919.59787A83.20056,83.20056,0,0,0,839.25751,314.16224Zm20.37523-178.1871H679.58866l-8.302,30.98309H819.17392L744.87569,442.95488H582.593a82.6909,82.6909,0,0,0,64.7694,30.9831H768.65389Zm76.56512,221.34832h71.61556l8.302-30.98309h-85.451a23.84434,23.84434,0,0,0-22.98725,17.61721L857.75725,529.08552A59.4924,59.4924,0,0,1,800.404,573.04177H658.68464l-8.30189,30.98309H805.93739a83.20031,83.20031,0,0,0,80.34019-61.573l49.92028-185.12841Zm-224.13124,42.8634,51.27166-190.46061H659.82683l-8.30189,30.9831h71.35428L688.28889,369.20353H566.99707v.00024A83.0594,83.0594,0,0,0,564.65,400.18686Z"
                        />
                    </symbol>
                    <mask id="sojs-mask-js">
                        <rect width="100%" height="100%" fill="black" />
                        <g
                            fill="none"
                            stroke="white"
                            strokeLinecap="square"
                            strokeMiterlimit={10}
                            className="soj-mask-lines"
                            style={{
                                '--lines': 3
                            }}
                        >
                            <polyline
                                data-name="J Outer"
                                points="675.438 151.467 839.403 151.467 756.765 458.446 582.593 458.446"
                                strokeWidth={31}
                                pathLength={1}
                                style={{
                                    '--l': 0,
                                    '--o': 1
                                }}
                            />
                            <polyline
                                data-name="J Middle"
                                points="665.557 188.342 791.256 188.342 728.471 421.571 571.454 421.571"
                                strokeWidth={31}
                                pathLength={1}
                                style={{
                                    '--l': 1,
                                    '--o': 1
                                }}
                            />
                            <polyline
                                data-name="J Inner"
                                points="655.676 225.218 743.109 225.218 700.178 384.695 565.824 384.695"
                                strokeWidth={31}
                                pathLength={1}
                                style={{
                                    '--l': 2,
                                    '--o': 1
                                }}
                            />
                            <path
                                data-name="S Outer"
                                d="M1031.72609,268.0808H922.36462c-36.0737,0-60.47371,21.66021-68.84683,52.76438L803.5975,505.97383a11.92216,11.92216,0,0,1-11.49339,8.80837H674.29546"
                                strokeWidth={35}
                                pathLength={1}
                                style={{
                                    '--l': 0,
                                    '--o': 2
                                }}
                            />
                            <path
                                data-name="S Middle"
                                d="M1021.84524,304.95636H927.8979a41.66774,41.66774,0,0,0-40.17028,30.78673L837.80746,520.871a41.66859,41.66859,0,0,1-40.17,30.78674H664.41461"
                                strokeWidth={35}
                                pathLength={1}
                                style={{
                                    '--l': 1,
                                    '--o': 2
                                }}
                            />
                            <path
                                data-name="S Inner"
                                d="M1011.96442,341.83191H933.43115a11.92218,11.92218,0,0,0-11.49363,8.80861L872.01742,535.7687a71.3463,71.3463,0,0,1-68.84674,52.76461h-148.637"
                                strokeWidth={35}
                                pathLength={1}
                                style={{
                                    '--l': 2,
                                    '--o': 2
                                }}
                            />
                        </g>
                    </mask>
                    <mask
                        id="sojs-mask-js-clone"
                        style={{
                            '--delay': 1
                        }}
                    >
                        <rect width="100%" height="100%" fill="black" />
                        <g
                            fill="none"
                            stroke="white"
                            strokeLinecap="square"
                            strokeMiterlimit={10}
                            className="soj-mask-lines"
                            style={{
                                '--lines': 3
                            }}
                        >
                            <polyline
                                data-name="J Outer"
                                points="675.438 151.467 839.403 151.467 756.765 458.446 582.593 458.446"
                                strokeWidth={31}
                                pathLength={1}
                                style={{
                                    '--l': 0,
                                    '--o': 1
                                }}
                            />
                            <polyline
                                data-name="J Middle"
                                points="665.557 188.342 791.256 188.342 728.471 421.571 571.454 421.571"
                                strokeWidth={31}
                                pathLength={1}
                                style={{
                                    '--l': 1,
                                    '--o': 1
                                }}
                            />
                            <polyline
                                data-name="J Inner"
                                points="655.676 225.218 743.109 225.218 700.178 384.695 565.824 384.695"
                                strokeWidth={31}
                                pathLength={1}
                                style={{
                                    '--l': 2,
                                    '--o': 1
                                }}
                            />
                            <path
                                data-name="S Outer"
                                d="M1031.72609,268.0808H922.36462c-36.0737,0-60.47371,21.66021-68.84683,52.76438L803.5975,505.97383a11.92216,11.92216,0,0,1-11.49339,8.80837H674.29546"
                                strokeWidth={35}
                                pathLength={1}
                                style={{
                                    '--l': 0,
                                    '--o': 2
                                }}
                            />
                            <path
                                data-name="S Middle"
                                d="M1021.84524,304.95636H927.8979a41.66774,41.66774,0,0,0-40.17028,30.78673L837.80746,520.871a41.66859,41.66859,0,0,1-40.17,30.78674H664.41461"
                                strokeWidth={35}
                                pathLength={1}
                                style={{
                                    '--l': 1,
                                    '--o': 2
                                }}
                            />
                            <path
                                data-name="S Inner"
                                d="M1011.96442,341.83191H933.43115a11.92218,11.92218,0,0,0-11.49363,8.80861L872.01742,535.7687a71.3463,71.3463,0,0,1-68.84674,52.76461h-148.637"
                                strokeWidth={35}
                                pathLength={1}
                                style={{
                                    '--l': 2,
                                    '--o': 2
                                }}
                            />
                        </g>
                    </mask>
                    <linearGradient
                        id="soj-grad-reshade"
                        x1={4725.785}
                        y1={232.538}
                        x2={5042.152}
                        y2={232.538}
                        gradientTransform="translate(2813.32582 4670.24612) rotate(-120)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0.015} stopColor="var(--color-grad-shade)" />
                        <stop offset={1} stopColor="var(--color-grad-shade)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                        id="soj-grad-reshade-alt-a"
                        x1={2728.755}
                        y1={3601.111}
                        x2={3045.122}
                        y2={3601.111}
                        gradientTransform="translate(5451.21469 -101.28857) rotate(120)"
                        xlinkHref="#soj-grad-reshade"
                    />
                    <linearGradient
                        id="soj-grad-reshade-alt-b"
                        x1={810}
                        y1={187.346}
                        x2={1126.367}
                        y2={187.346}
                        gradientTransform="matrix(1, 0, 0, 1, 0, 0)"
                        xlinkHref="#soj-grad-reshade"
                    />
                    <linearGradient
                        id="soj-grad-inner-cube"
                        x1={651.817}
                        y1={461.327}
                        x2={951.838}
                        y2={288.11}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-grad-inner-cube-a)" />
                        <stop offset={0.2} stopColor="var(--color-grad-inner-cube-b)" />
                        <stop offset={0.4} stopColor="var(--color-grad-inner-cube-c)" />
                        <stop offset={0.6} stopColor="var(--color-grad-inner-cube-d)" />
                        <stop offset={0.8} stopColor="var(--color-grad-inner-cube-e)" />
                        <stop offset={1} stopColor="var(--color-grad-inner-cube-f)" />
                    </linearGradient>
                    <linearGradient
                        id="soj-grad-inner-cube-alt-a"
                        x1={625.452}
                        y1={385.221}
                        x2={986.764}
                        y2={176.618}
                        xlinkHref="#soj-grad-inner-cube"
                    />
                    <linearGradient
                        id="soj-grad-inner-cube-alt-b"
                        x1={663.752}
                        y1={545.763}
                        x2={1001.907}
                        y2={350.53}
                        xlinkHref="#soj-grad-inner-cube"
                    />
                    <linearGradient
                        id="soj-grad-logo-shape"
                        x1={579.392}
                        y1={322.944}
                        x2={987.71}
                        y2={432.352}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-grad-logo-shape-a)" />
                        <stop offset={0.167} stopColor="var(--color-grad-logo-shape-b)" />
                        <stop offset={0.333} stopColor="var(--color-grad-logo-shape-c)" />
                        <stop offset={0.5} stopColor="var(--color-grad-logo-shape-d)" />
                        <stop offset={0.667} stopColor="var(--color-grad-logo-shape-c)" />
                        <stop offset={0.833} stopColor="var(--color-grad-logo-shape-b)" />
                        <stop offset={1} stopColor="var(--color-grad-logo-shape-a)" />
                    </linearGradient>
                    <radialGradient
                        id="soj-grad-cube-shape"
                        cx={810}
                        cy={370}
                        fy={733.625}
                        r={363.628}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-grad-logo-cube-shape-a)" />
                        <stop offset={1} stopColor="var(--color-grad-logo-cube-shape-b)" />
                    </radialGradient>
                    <radialGradient
                        id="soj-grad-cube-lighting-left"
                        cx={6913.188}
                        cy={-1234.828}
                        r={368.359}
                        gradientTransform="translate(-6102.81684 1964.37052)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-grad-cube-lighting-left-a)" />
                        <stop
                            offset={0.001}
                            stopColor="var(--color-grad-cube-lighting-left-a)"
                            stopOpacity={0.997}
                        />
                        <stop
                            offset={0.096}
                            stopColor="var(--color-grad-cube-lighting-left-b)"
                            stopOpacity={0.796}
                        />
                        <stop
                            offset={0.188}
                            stopColor="var(--color-grad-cube-lighting-left-c)"
                            stopOpacity={0.629}
                        />
                        <stop
                            offset={0.277}
                            stopColor="var(--color-grad-cube-lighting-left-d)"
                            stopOpacity={0.499}
                        />
                        <stop
                            offset={0.36}
                            stopColor="var(--color-grad-cube-lighting-left-e)"
                            stopOpacity={0.406}
                        />
                        <stop
                            offset={0.437}
                            stopColor="var(--color-grad-cube-lighting-left-f)"
                            stopOpacity={0.349}
                        />
                        <stop
                            offset={0.5}
                            stopColor="var(--color-grad-cube-lighting-left-g)"
                            stopOpacity={0.33}
                        />
                        <stop
                            offset={1}
                            stopColor="var(--color-grad-cube-lighting-left-h)"
                            stopOpacity={0}
                        />
                    </radialGradient>
                    <radialGradient
                        id="soj-grad-cube-lighting-right"
                        cx={6345.509}
                        cy={-1773.388}
                        r={358.799}
                        gradientTransform="matrix(-1, 0, 0, 1, 7469.89672, 1964.37052)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-grad-cube-lighting-right-a)" />
                        <stop
                            offset={0.5}
                            stopColor="var(--color-grad-cube-lighting-right-b)"
                            stopOpacity={0.33}
                        />
                        <stop
                            offset={1}
                            stopColor="var(--color-grad-cube-lighting-right-c)"
                            stopOpacity={0}
                        />
                    </radialGradient>
                    <radialGradient
                        id="soj-grad-cube-lighting-top"
                        cx={6603.152}
                        cy={-1771.552}
                        r={345.558}
                        gradientTransform="translate(-6102.81684 1964.37052)"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset={0} stopColor="var(--color-grad-cube-lighting-top-a)" />
                        <stop
                            offset={0.5}
                            stopColor="var(--color-grad-cube-lighting-top-b)"
                            stopOpacity={0.33}
                        />
                        <stop
                            offset={1}
                            stopColor="var(--color-grad-cube-lighting-top-c)"
                            stopOpacity={0}
                        />
                    </radialGradient>
                </defs>
                <g data-name="CUBE">
                    <g className="soj-cube-outer">
                        <polygon
                            data-name="BG Shape"
                            points="1126.367 552.654 1126.367 187.346 810 4.691 493.633 187.346 493.633 552.654 810 735.309 1126.367 552.654"
                            fill="#040823"
                        />
                        <polygon
                            data-name="Radial BG"
                            points="1126.367 552.655 1126.367 187.346 810 4.691 493.633 187.346 493.633 552.655 810 735.309 1126.367 552.655"
                            fill="url(#soj-grad-cube-shape)"
                        />
                        <g data-name="Cube Reshade" opacity={0.5}>
                            <polygon
                                id="e6aee2a2-7e52-4369-a68e-503b2a26ca0a"
                                data-name="Cube Reshade Left"
                                points="493.633 552.654 810 370 493.633 187.346 493.633 552.654"
                                fill="url(#soj-grad-reshade)"
                            />
                            <polygon
                                id="e69ca1ac-ed48-46e8-945b-543658fa6db6"
                                data-name="Cube Reshade Right"
                                points="1126.367 552.654 810 370 810 735.309 1126.367 552.654"
                                fill="url(#soj-grad-reshade-alt-a)"
                            />
                            <polygon
                                id="eae06b45-a3ca-44df-aa1a-a4166d8ddc3e"
                                data-name="Cube Reshade Top"
                                points="810 4.691 810 370 1126.367 187.346 810 4.691"
                                fill="url(#soj-grad-reshade-alt-b)"
                            />
                        </g>
                    </g>
                    <g data-name="Cube Lighting">
                        <polygon
                            className="soj-cube-lighting soj-cube-lighting--left"
                            data-name="Cube Face Left"
                            points="810 735.309 810 370 493.633 187.346 493.633 552.654 810 735.309"
                            fill="url(#soj-grad-cube-lighting-left)"
                        />
                        <polygon
                            className="soj-cube-lighting soj-cube-lighting--right"
                            data-name="Cube Face Right"
                            points="810 735.309 810 370 1126.367 187.346 1126.367 552.654 810 735.309"
                            fill="url(#soj-grad-cube-lighting-right)"
                        />
                        <polygon
                            className="soj-cube-lighting soj-cube-lighting--top"
                            data-name="Cube Face Top"
                            points="810 4.691 493.633 187.346 810 370 1126.367 187.346 810 4.691"
                            fill="url(#soj-grad-cube-lighting-top)"
                        />
                    </g>
                    <g className="soj-cube-inner" data-name="Inner Cube">
                        <polygon
                            points="810 370 651.817 278.673 651.817 461.327 810 552.654 810 370"
                            fill="url(#soj-grad-inner-cube)"
                        />
                        <polygon
                            points="651.817 278.673 810 370 968.183 278.673 810 187.346 651.817 278.673"
                            fill="url(#soj-grad-inner-cube-alt-a)"
                        />
                        <polygon
                            points="810 552.654 968.183 461.327 968.183 278.673 810 370 810 552.654"
                            fill="url(#soj-grad-inner-cube-alt-b)"
                        />
                    </g>
                </g>
                <g data-name="Text Frames">
                    <g className="soj-text-frame soj-text-frame--right" data-name="Frame Right">
                        <polygon points="1611.926 252.59 1047.777 252.59 1045.174 262.262 1611.926 262.262 1611.926 252.59" />
                        <polygon points="1611.926 347.651 1022.322 347.651 1019.718 357.323 1611.926 357.323 1611.926 347.651" />
                    </g>
                    <g className="soj-text-frame soj-text-frame--left" data-name="Frame Left">
                        <polygon points="8.074 262.262 705.093 262.262 707.697 252.589 8.074 252.589 8.074 262.262" />
                        <polygon points="8.074 357.323 679.579 357.323 682.183 347.651 8.074 347.651 8.074 357.323" />
                    </g>
                </g>
                <g data-name="Text">
                    <g className="soj-text soj-text--stateof" data-name="State Of">
                        <g
                            style={{
                                '--char': 1
                            }}
                        >
                            <text fontSize={70} textAnchor="start" x={9} y={330}>
                                {'S'}
                            </text>
                        </g>
                        <g
                            style={{
                                '--char': 2
                            }}
                        >
                            <text fontSize={70} textAnchor="start" x={39} y={330}>
                                {'T'}
                            </text>
                        </g>
                        <g
                            style={{
                                '--char': 3
                            }}
                        >
                            <text fontSize={70} textAnchor="start" x={67} y={330}>
                                {'A'}
                            </text>
                        </g>
                        <g
                            style={{
                                '--char': 4
                            }}
                        >
                            <text fontSize={70} textAnchor="start" x={99} y={330}>
                                {'T'}
                            </text>
                        </g>
                        <g
                            style={{
                                '--char': 5
                            }}
                        >
                            <text fontSize={70} textAnchor="start" x={130} y={330}>
                                {'E'}
                            </text>
                        </g>
                        <g
                            style={{
                                '--char': 6
                            }}
                        >
                            <text fontSize={70} textAnchor="start" x={176} y={330}>
                                {'O'}
                            </text>
                        </g>
                        <g
                            style={{
                                '--char': 7
                            }}
                        >
                            <text fontSize={70} textAnchor="start" x={209} y={330}>
                                {'F'}
                            </text>
                        </g>
                    </g>
                    <g className="soj-text soj-text--year" data-name="Y2021">
                        <g
                            style={{
                                '--char': 4
                            }}
                        >
                            <text
                                fontSize={70}
                                textAnchor="end"
                                x={1521}
                                y={330}
                                data-year-char={1}
                            >
                                {'\n          2\n        '}
                            </text>
                        </g>
                        <g
                            style={{
                                '--char': 3
                            }}
                        >
                            <text
                                fontSize={70}
                                textAnchor="end"
                                x={1553}
                                y={330}
                                data-year-char={2}
                            >
                                {'\n          0\n        '}
                            </text>
                        </g>
                        <g
                            style={{
                                '--char': 2
                            }}
                        >
                            <text
                                fontSize={70}
                                textAnchor="end"
                                x={1584}
                                y={330}
                                data-year-char={3}
                            >
                                {'\n          2\n        '}
                            </text>
                        </g>
                        <g
                            style={{
                                '--char': 1
                            }}
                        >
                            <text
                                fontSize={70}
                                textAnchor="end"
                                x={1611}
                                y={330}
                                data-year-char={4}
                            >
                                {'\n          5\n        '}
                            </text>
                        </g>
                    </g>
                </g>
                <g mask="url(#sojs-mask-js)">
                    <use xlinkHref="#soj-shape-js" className="soj-shape--under" />
                </g>
                <g mask="url(#sojs-mask-js-clone)">
                    <use xlinkHref="#soj-shape-js" fill="url(#soj-grad-logo-shape)" />
                </g>
            </svg>
        </div>
    </Wrapper>
)

const Wrapper = styled.div`
    margin: 0 auto;
    margin-bottom: ${spacing()};
    max-width: 700px;
    width: 100%;
    /* img {
        display: block;
        width: 100%;
    } */

    /* .logo * {
        transform-box: fill-box;
        transform-origin: 50% 50%;
    } */

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
    .soj-logo__wrapper {
        --color-frame: #ffe337;
        --color-text: #ded5c6;
        --color-bg: #272325;
        --color-grad-shade: #787511;
        --color-grad-inner-cube-a: #f77f57;
        --color-grad-inner-cube-b: #ffe337;
        --color-grad-inner-cube-c: #c6ae10;
        --color-grad-inner-cube-d: #c2ad24;
        --color-grad-inner-cube-e: #f5e57a;
        --color-grad-inner-cube-f: #f4e371;
        --color-grad-logo-shape-a: #544d40;
        --color-grad-logo-shape-b: #aca495;
        --color-grad-logo-shape-c: #dbd2c3;
        --color-grad-logo-shape-d: #e9e0d1;
        --color-grad-logo-cube-shape-a: #333110;
        --color-grad-logo-cube-shape-b: #656629;
        --color-grad-cube-lighting-left-a: #ffd724;
        --color-grad-cube-lighting-left-b: #faea3c;
        --color-grad-cube-lighting-left-c: #edf550;
        --color-grad-cube-lighting-left-d: #daf260;
        --color-grad-cube-lighting-left-e: #e7ef6b;
        --color-grad-cube-lighting-left-f: #cbee6d;
        --color-grad-cube-lighting-left-g: #e5ee72;
        --color-grad-cube-lighting-left-h: #bfba31;
        --color-grad-cube-lighting-right-a: #f1e900;
        --color-grad-cube-lighting-right-b: #e1ff00;
        --color-grad-cube-lighting-right-c: #baff24;
        --color-grad-cube-lighting-top-a: #bfba32;
        --color-grad-cube-lighting-top-b: #eed372;
        --color-grad-cube-lighting-top-c: #fff824;
        --timeline-base-delay: 100ms;
        --timeline-logo-anim: 800ms;
        --timeline-logo-delay: var(--timeline-base-delay);
        --timeline-cube-inner-anim: 800ms;
        --timeline-cube-inner-delay: calc(
            var(--timeline-logo-delay) + var(--timeline-logo-anim) * 0.25 + 600ms
        );
        --timeline-cube-outer-anim: 800ms;
        --timeline-cube-outer-delay: calc(var(--timeline-cube-inner-delay) + 150ms);
        --timeline-text-frame-anim: 900ms;
        --timeline-text-frame-delay: calc(
            200ms + var(--timeline-cube-outer-delay) + var(--timeline-cube-outer-anim) * 0.25
        );
        --timeline-text-anim: 800ms;
        --timeline-text-delay: calc(
            var(--timeline-text-frame-delay) + var(--timeline-text-frame-anim) * 0.5625
        );
        --timeline-lighting-anim: 6000ms;
        --timeline-lighting-delay: calc(
            var(--timeline-cube-outer-delay) + var(--timeline-cube-outer-anim)
        );
        --ease-whisk-in-out: cubic-bezier(0.85, 0, 0.15, 1);
        --ease-soft-out: cubic-bezier(0, 0, 0.15, 1);
        --ease-circ-out: cubic-bezier(0, 0, 0, 1);
        --ease-bouncy-out: cubic-bezier(0.6, 1.5, 0.4, 1);
        --ease-bouncy-in-out: cubic-bezier(0.25, -0.25, 0.1, 1.25);
        background: var(--color-bg);
    }

    svg {
        width: 100%;
        max-width: 700px;
        height: auto;
        margin: auto;
    }

    .soj-logo__wrapper {
        padding: 30px;
        background: var(--color-bg);
    }

    .soj-logo {
        display: block;
        margin: auto;
        overflow: visible !important;
    }

    .soj-logo * {
        transform-box: fill-box;
        transform-origin: 50% 50%;
    }

    .soj-text-frame {
        --dir: 0.25;
        fill: var(--color-frame);
        animation: slideIn var(--timeline-text-frame-anim) var(--ease-soft-out)
            var(--timeline-text-frame-delay, 50ms) backwards 1;
    }

    .soj-text-frame--right {
        --dir: -0.25;
    }

    .soj-cube-inner {
        animation: scaleIn var(--timeline-cube-inner-anim) var(--ease-bouncy-out)
            var(--timeline-cube-inner-delay, 50ms) backwards 1;
    }

    .soj-cube-outer {
        animation: scaleIn var(--timeline-cube-inner-anim) var(--ease-bouncy-out)
            var(--timeline-cube-outer-delay, 50ms) backwards 1;
    }

    .soj-mask-lines > * {
        stroke-dasharray: 1 1;
        will-change: stroke-dashoffset;
        animation: lineIn var(--timeline-logo-anim) var(--ease-whisk-in-out)
            calc(
                var(--delay, 0) * 200ms + var(--timeline-logo-delay, 0ms) +
                    calc(var(--l, 0) / var(--lines, 3) * 1.5) * var(--timeline-logo-anim) * 0.4
            )
            backwards 1;
    }

    .soj-shape--under {
        fill: var(--color-frame);
        animation: fadeOut 300ms linear
            calc(var(--timeline-logo-anim) * 2 + var(--timeline-logo-delay, 0ms)) forwards 1;
    }

    .soj-text {
        --dir: 4;
        font-family: 'Bebas Neue', 'BebasNeue', 'BebasNeueBold', 'Bebas', Helvetica, sans-serif;
        font-weight: 400;
    }
    .soj-text > * {
        fill: var(--color-text);
        will-change: transform;
        animation: slideIn var(--timeline-text-anim) var(--ease-circ-out)
            calc(var(--char) * 75ms + var(--timeline-text-delay, 50ms)) backwards 1;
    }
    .soj-text * {
        font-family: inherit;
    }

    .soj-text--year {
        --dir: -6;
    }

    .soj-cube-lighting {
        transform-origin: var(--tr, 50% 50%);
        animation: scaleIn var(--timeline-lighting-anim) var(--ease-circ-out)
            var(--timeline-lighting-delay, 50ms) backwards 1;
    }

    .soj-cube-lighting--left {
        --tr: 100% 100%;
    }

    .soj-cube-lighting--right {
        --tr: 100% 0%;
    }

    .soj-cube-lighting--top {
        --tr: 0% 50%;
    }

    @keyframes slideIn {
        from {
            filter: opacity(0%);
            opacity: 0;
            transform: translateX(calc(var(--dir, 1) * 50%));
        }
    }
    @keyframes scaleIn {
        from {
            transform: scale(0.0001);
        }
    }
    @keyframes lineIn {
        from {
            opacity: 0;
            stroke-dashoffset: var(--dir, 1);
        }
        0.1% {
            opacity: 1;
        }
    }
    @keyframes fadeOut {
        to {
            opacity: 0;
        }
    }
`

export default Logo
