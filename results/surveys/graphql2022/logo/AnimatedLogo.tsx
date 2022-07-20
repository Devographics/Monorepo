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
    <Wrapper aria-label="State of JS 2021" className="logo__wrapper">
        <LogoSVG
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="1620"
            height="740"
            viewBox="0 0 1620 740"
            className="soj-logo"
            aria-label="State of JS 2021"
        >
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
                        strokeMiterlimit="10"
                        className="soj-mask-lines"
                        style={{ '--lines': 3 } as React.CSSProperties}
                    >
                        <polyline
                            data-name="J Outer"
                            points="675.438 151.467 839.403 151.467 756.765 458.446 582.593 458.446"
                            strokeWidth="31"
                            pathLength="1"
                            style={{ '--l': 0, '--o': 1 } as React.CSSProperties}
                        />
                        <polyline
                            data-name="J Middle"
                            points="665.557 188.342 791.256 188.342 728.471 421.571 571.454 421.571"
                            strokeWidth="31"
                            pathLength="1"
                            style={{ '--l': 1, '--o': 1 } as React.CSSProperties}
                        />
                        <polyline
                            data-name="J Inner"
                            points="655.676 225.218 743.109 225.218 700.178 384.695 565.824 384.695"
                            strokeWidth="31"
                            pathLength="1"
                            style={{ '--l': '2', '--o': ' 1' } as React.CSSProperties}
                        />
                        <path
                            data-name="S Outer"
                            d="M1031.72609,268.0808H922.36462c-36.0737,0-60.47371,21.66021-68.84683,52.76438L803.5975,505.97383a11.92216,11.92216,0,0,1-11.49339,8.80837H674.29546"
                            strokeWidth="35"
                            pathLength="1"
                            style={{ '--l': 0, '--o': 2 } as React.CSSProperties}
                        />
                        <path
                            data-name="S Middle"
                            d="M1021.84524,304.95636H927.8979a41.66774,41.66774,0,0,0-40.17028,30.78673L837.80746,520.871a41.66859,41.66859,0,0,1-40.17,30.78674H664.41461"
                            strokeWidth="35"
                            pathLength="1"
                            style={{ '--l': 1, '--o': 2 } as React.CSSProperties}
                        />
                        <path
                            data-name="S Inner"
                            d="M1011.96442,341.83191H933.43115a11.92218,11.92218,0,0,0-11.49363,8.80861L872.01742,535.7687a71.3463,71.3463,0,0,1-68.84674,52.76461h-148.637"
                            strokeWidth="35"
                            pathLength="1"
                            style={{ '--l': 2, '--o': 2 } as React.CSSProperties}
                        />
                    </g>
                </mask>
                <mask id="sojs-mask-js-clone" style={{ '--delay': '1' } as React.CSSProperties}>
                    <rect width="100%" height="100%" fill="black" />
                    <g
                        fill="none"
                        stroke="white"
                        strokeLinecap="square"
                        strokeMiterlimit="10"
                        className="soj-mask-lines"
                        style={{ '--lines': 3 } as React.CSSProperties}
                    >
                        <polyline
                            data-name="J Outer"
                            points="675.438 151.467 839.403 151.467 756.765 458.446 582.593 458.446"
                            strokeWidth="31"
                            pathLength="1"
                            style={{ '--l': 0, '--o': 1 } as React.CSSProperties}
                        />
                        <polyline
                            data-name="J Middle"
                            points="665.557 188.342 791.256 188.342 728.471 421.571 571.454 421.571"
                            strokeWidth="31"
                            pathLength="1"
                            style={{ '--l': 1, '--o': 1 } as React.CSSProperties}
                        />
                        <polyline
                            data-name="J Inner"
                            points="655.676 225.218 743.109 225.218 700.178 384.695 565.824 384.695"
                            strokeWidth="31"
                            pathLength="1"
                            style={{ '--l': 2, '--o': 1 } as React.CSSProperties}
                        />
                        <path
                            data-name="S Outer"
                            d="M1031.72609,268.0808H922.36462c-36.0737,0-60.47371,21.66021-68.84683,52.76438L803.5975,505.97383a11.92216,11.92216,0,0,1-11.49339,8.80837H674.29546"
                            strokeWidth="35"
                            pathLength="1"
                            style={{ '--l': 0, '--o': 2 } as React.CSSProperties}
                        />
                        <path
                            data-name="S Middle"
                            d="M1021.84524,304.95636H927.8979a41.66774,41.66774,0,0,0-40.17028,30.78673L837.80746,520.871a41.66859,41.66859,0,0,1-40.17,30.78674H664.41461"
                            strokeWidth="35"
                            pathLength="1"
                            style={{ '--l': 1, '--o': 2 } as React.CSSProperties}
                        />
                        <path
                            data-name="S Inner"
                            d="M1011.96442,341.83191H933.43115a11.92218,11.92218,0,0,0-11.49363,8.80861L872.01742,535.7687a71.3463,71.3463,0,0,1-68.84674,52.76461h-148.637"
                            strokeWidth="35"
                            pathLength="1"
                            style={{ '--l': 2, '--o': 2 } as React.CSSProperties}
                        />
                    </g>
                </mask>

                <linearGradient
                    id="bcf766d2-8ea2-4e60-9ad3-d993642f803f"
                    x1="4725.785"
                    y1="232.538"
                    x2="5042.152"
                    y2="232.538"
                    gradientTransform="translate(2813.32582 4670.24612) rotate(-120)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset=".015" stopColor="#1e1b4a" />
                    <stop offset="1" stopColor="#1e1b4a" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                    id="a04407a9-6753-4196-9d50-edb0ff94a8a8"
                    x1="2728.755"
                    y1="3601.111"
                    x2="3045.122"
                    y2="3601.111"
                    gradientTransform="translate(5451.21469 -101.28857) rotate(120)"
                    xlinkHref="#bcf766d2-8ea2-4e60-9ad3-d993642f803f"
                />
                <linearGradient
                    id="aad2d409-2e7d-4246-b8e1-e5d368a0f8c5"
                    x1="810"
                    y1="187.346"
                    x2="1126.367"
                    y2="187.346"
                    gradientTransform="matrix(1, 0, 0, 1, 0, 0)"
                    xlinkHref="#bcf766d2-8ea2-4e60-9ad3-d993642f803f"
                />
                <linearGradient
                    id="bd3fde97-c7e4-416f-80dc-1d2fe30d0c21"
                    x1="651.817"
                    y1="461.327"
                    x2="951.838"
                    y2="288.11"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#f7b457" />
                    <stop offset=".2" stopColor="#ed4a4f" />
                    <stop offset=".4" stopColor="#bf4c9c" />
                    <stop offset=".6" stopColor="#7552cc" />
                    <stop offset=".8" stopColor="#2f74ed" />
                    <stop offset="1" stopColor="#1595e7" />
                </linearGradient>
                <linearGradient
                    id="e6bd5b83-99bd-4869-840a-045660b63aaa"
                    x1="625.452"
                    y1="385.221"
                    x2="986.764"
                    y2="176.618"
                    xlinkHref="#bd3fde97-c7e4-416f-80dc-1d2fe30d0c21"
                />
                <linearGradient
                    id="a3242361-b060-4212-a99c-a48fc235a7ac"
                    x1="663.752"
                    y1="545.763"
                    x2="1001.907"
                    y2="350.53"
                    xlinkHref="#bd3fde97-c7e4-416f-80dc-1d2fe30d0c21"
                />
                <linearGradient
                    id="a95ccac3-a4e0-4176-9f8e-d2d9d9f59969"
                    x1="579.392"
                    y1="322.944"
                    x2="987.71"
                    y2="432.352"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#544d40" />
                    <stop offset=".167" stopColor="#aca495" />
                    <stop offset=".333" stopColor="#dbd2c3" />
                    <stop offset=".5" stopColor="#e9e0d1" />
                    <stop offset=".667" stopColor="#dbd2c3" />
                    <stop offset=".833" stopColor="#aca495" />
                    <stop offset="1" stopColor="#544d40" />
                </linearGradient>
                <radialGradient
                    id="e4fba32e-274b-42d7-8fe9-036991858575"
                    cx="810"
                    cy="370"
                    fy="733.625"
                    r="363.628"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#101033" />
                    <stop offset="1" stopColor="#3a2966" />
                </radialGradient>
                <radialGradient
                    id="ee69ffb6-329f-4678-b28e-cd4ba3865f14"
                    cx="6913.188"
                    cy="-1234.828"
                    r="368.359"
                    gradientTransform="translate(-6102.81684 1964.37052)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#2496ff" />
                    <stop offset=".001" stopColor="#2496ff" stopOpacity=".997" />
                    <stop offset=".096" stopColor="#3c8afa" stopOpacity=".796" />
                    <stop offset=".188" stopColor="#5080f5" stopOpacity=".629" />
                    <stop offset=".277" stopColor="#6078f2" stopOpacity=".499" />
                    <stop offset=".36" stopColor="#6b73ef" stopOpacity=".406" />
                    <stop offset=".437" stopColor="#726fee" stopOpacity=".349" />
                    <stop offset=".5" stopColor="#746eed" stopOpacity=".33" />
                    <stop offset="1" stopColor="#a332bf" stopOpacity="0" />
                </radialGradient>
                <radialGradient
                    id="a6f001a4-8500-499d-8326-8429a762da9e"
                    cx="6345.509"
                    cy="-1773.388"
                    r="358.799"
                    gradientTransform="matrix(-1, 0, 0, 1, 7469.89672, 1964.37052)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#00d2f1" />
                    <stop offset=".5" stopColor="#00b7ff" stopOpacity=".33" />
                    <stop offset="1" stopColor="#2496ff" stopOpacity="0" />
                </radialGradient>
                <radialGradient
                    id="b5b00227-c685-4b2e-88a0-a1df6605ba20"
                    cx="6603.152"
                    cy="-1771.552"
                    r="345.558"
                    gradientTransform="translate(-6102.81684 1964.37052)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#a332bf" />
                    <stop offset=".5" stopColor="#746eed" stopOpacity=".33" />
                    <stop offset="1" stopColor="#2496ff" stopOpacity="0" />
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
                        fill="url(#e4fba32e-274b-42d7-8fe9-036991858575)"
                    />

                    <g data-name="Cube Reshade" opacity=".5">
                        <polygon
                            id="e6aee2a2-7e52-4369-a68e-503b2a26ca0a"
                            data-name="Cube Reshade Left"
                            points="493.633 552.654 810 370 493.633 187.346 493.633 552.654"
                            fill="url(#bcf766d2-8ea2-4e60-9ad3-d993642f803f)"
                        />
                        <polygon
                            id="e69ca1ac-ed48-46e8-945b-543658fa6db6"
                            data-name="Cube Reshade Right"
                            points="1126.367 552.654 810 370 810 735.309 1126.367 552.654"
                            fill="url(#a04407a9-6753-4196-9d50-edb0ff94a8a8)"
                        />
                        <polygon
                            id="eae06b45-a3ca-44df-aa1a-a4166d8ddc3e"
                            data-name="Cube Reshade Top"
                            points="810 4.691 810 370 1126.367 187.346 810 4.691"
                            fill="url(#aad2d409-2e7d-4246-b8e1-e5d368a0f8c5)"
                        />
                    </g>
                </g>

                <g data-name="Cube Lighting">
                    <polygon
                        className="soj-cube-lighting soj-cube-lighting--left"
                        data-name="Cube Face Left"
                        points="810 735.309 810 370 493.633 187.346 493.633 552.654 810 735.309"
                        fill="url(#ee69ffb6-329f-4678-b28e-cd4ba3865f14)"
                    />
                    <polygon
                        className="soj-cube-lighting soj-cube-lighting--right"
                        data-name="Cube Face Right"
                        points="810 735.309 810 370 1126.367 187.346 1126.367 552.654 810 735.309"
                        fill="url(#a6f001a4-8500-499d-8326-8429a762da9e)"
                    />
                    <polygon
                        className="soj-cube-lighting soj-cube-lighting--top"
                        data-name="Cube Face Top"
                        points="810 4.691 493.633 187.346 810 370 1126.367 187.346 810 4.691"
                        fill="url(#b5b00227-c685-4b2e-88a0-a1df6605ba20)"
                    />
                </g>

                <g className="soj-cube-inner" data-name="Inner Cube">
                    <polygon
                        points="810 370 651.817 278.673 651.817 461.327 810 552.654 810 370"
                        fill="url(#bd3fde97-c7e4-416f-80dc-1d2fe30d0c21)"
                    />
                    <polygon
                        points="651.817 278.673 810 370 968.183 278.673 810 187.346 651.817 278.673"
                        fill="url(#e6bd5b83-99bd-4869-840a-045660b63aaa)"
                    />
                    <polygon
                        points="810 552.654 968.183 461.327 968.183 278.673 810 370 810 552.654"
                        fill="url(#a3242361-b060-4212-a99c-a48fc235a7ac)"
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
                    <path
                        d="M21.61142,279.17591c7.70459,0,11.665,4.6084,11.665,12.67334v1.584H25.78769v-2.08838c0-3.6001-1.43994-4.96826-3.96-4.96826-2.52051,0-3.96045,1.36816-3.96045,4.96826,0,10.36914,15.48144,12.313,15.48144,26.71436,0,8.06494-4.03271,12.67334-11.80908,12.67334-7.77685,0-11.80908-4.6084-11.80908-12.67334V314.963h7.48877v3.60059c0,3.6001,1.584,4.896,4.104,4.896,2.52051,0,4.10449-1.2959,4.10449-4.896,0-10.36914-15.48144-12.31348-15.48144-26.71436C9.94638,283.78431,13.90683,279.17591,21.61142,279.17591Z"
                        style={{ '--char': 1 } as React.CSSProperties}
                    />
                    <path
                        d="M39.898,279.75209H64.38v7.20068H56.09921v43.20361H48.1788V286.95277H39.898Z"
                        style={{ '--char': 2 } as React.CSSProperties}
                    />
                    <path
                        d="M95.05234,330.15638H87.05966l-1.36816-9.145H75.9703l-1.36767,9.145h-7.273l8.06494-50.40429H86.98739ZM76.97861,314.171h7.63281L80.795,288.6808Z"
                        style={{ '--char': 3 } as React.CSSProperties}
                    />
                    <path
                        d="M100.73739,279.75209h24.48194v7.20068h-8.28076v43.20361h-7.92041V286.95277h-8.28077Z"
                        style={{ '--char': 4 } as React.CSSProperties}
                    />
                    <path
                        d="M140.91269,300.99379h10.873v7.20068h-10.873V322.9557h13.68115v7.20068H132.99228V279.75209h21.60156v7.20068H140.91269Z"
                        style={{ '--char': 5 } as React.CSSProperties}
                    />
                    <path
                        d="M178.63974,291.84925c0-8.06494,4.24805-12.67334,12.0249-12.67334,7.77637,0,12.0249,4.6084,12.0249,12.67334v26.21c0,8.06494-4.24853,12.67334-12.0249,12.67334-7.77685,0-12.0249-4.6084-12.0249-12.67334Zm7.92041,26.71436c0,3.6001,1.584,4.96826,4.10449,4.96826,2.52,0,4.10449-1.36816,4.10449-4.96826V291.34486c0-3.6001-1.58447-4.96826-4.10449-4.96826-2.52051,0-4.10449,1.36816-4.10449,4.96826Z"
                        style={{ '--char': 6 } as React.CSSProperties}
                    />
                    <path
                        d="M220.04013,302.14613h10.2251v7.20068h-10.2251v20.80957h-7.92041V279.75209h20.95361v7.20068h-13.0332Z"
                        style={{ '--char': 7 } as React.CSSProperties}
                    />
                </g>

                <g className="soj-text soj-text--year" data-name="Y2021">
                    <path
                        d="M1505.87216,286.3766c-2.51953,0-4.10352,1.36816-4.10352,4.96826v5.40039h-7.48925v-4.896c0-8.06494,4.03222-12.67334,11.80957-12.67334,7.77636,0,11.80859,4.6084,11.80859,12.67334,0,15.84131-15.76953,21.74561-15.76953,30.02637a5.43026,5.43026,0,0,0,.07227,1.08008h14.97753v7.20068h-22.89843V323.964c0-14.8335,15.69726-17.28174,15.69726-31.82715C1509.97665,287.60072,1508.39267,286.3766,1505.87216,286.3766Z"
                        style={{ '--char': 4 } as React.CSSProperties}
                    />
                    <path
                        d="M1526.463,291.84925c0-8.06494,4.248-12.67334,12.02539-12.67334,7.77637,0,12.02442,4.6084,12.02442,12.67334v26.21c0,8.06494-4.248,12.67334-12.02442,12.67334-7.77734,0-12.02539-4.6084-12.02539-12.67334Zm7.9209,26.71436c0,3.6001,1.584,4.96826,4.10449,4.96826,2.51953,0,4.10449-1.36816,4.10449-4.96826V291.34486c0-3.6001-1.585-4.96826-4.10449-4.96826-2.52051,0-4.10449,1.36816-4.10449,4.96826Z"
                        style={{ '--char': 3 } as React.CSSProperties}
                    />
                    <path
                        d="M1571.53622,286.3766c-2.52051,0-4.10449,1.36816-4.10449,4.96826v5.40039h-7.48828v-4.896c0-8.06494,4.03223-12.67334,11.80859-12.67334s11.80957,4.6084,11.80957,12.67334c0,15.84131-15.76953,21.74561-15.76953,30.02637a5.50355,5.50355,0,0,0,.07129,1.08008h14.97754v7.20068h-22.89746V323.964c0-14.8335,15.69726-17.28174,15.69726-31.82715C1575.64071,287.60072,1574.05673,286.3766,1571.53622,286.3766Z"
                        style={{ '--char': 2 } as React.CSSProperties}
                    />
                    <path
                        d="M1591.1915,286.08851c6.12011,0,7.48828-2.95215,8.71191-6.33642h5.3291v50.40429h-7.9209V291.70521h-6.12011Z"
                        style={{ '--char': 1 } as React.CSSProperties}
                    />
                </g>
            </g>

            <g mask="url(#sojs-mask-js)">
                <use xlinkHref="#soj-shape-js" className="soj-shape--under" />
            </g>
            <g mask="url(#sojs-mask-js-clone)">
                <use xlinkHref="#soj-shape-js" fill="url(#a95ccac3-a4e0-4176-9f8e-d2d9d9f59969)" />
            </g>
        </LogoSVG>
    </Wrapper>
)

// const scaleXIn = keyframes`
//   from {
//       transform: scaleX(0);
//   }
// `

// const scaleIn = keyframes`
//   from {
//       transform: scaleY(0) scaleX(0.6667);
//   }
// `

// const pathIn = keyframes`
//   from {
//       stroke-dashoffset: 100;
//   }
// `

// const textIn = keyframes`
//   from {
//       transform: translateY(100%);
//   }
// `

// const fadeIn = keyframes`
//   from {
//       fill-opacity: 0;
//   }
// `

// const clockIn = keyframes`
//   from {
//       transform: rotate(var(--a, 30deg));
//       fill-opacity: 0;
//   }
//   0.1% {
//       fill-opacity: 1;
//   }
// `

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
`

const LogoSVG = styled.svg`
    --color-frame: #f7b457; // Yellow
    --color-frame: #00d2f1; // Blue
    --color-text: #ded5c6;

    --timeline-base-delay: 300ms;
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

    width: 100%;
    max-width: 700px;
    height: auto;
    margin: auto;
    overflow: visible !important;

    & * {
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

        & > path {
            fill: var(--color-text);

            animation: slideIn var(--timeline-text-anim) var(--ease-circ-out)
                calc(var(--char) * 75ms + var(--timeline-text-delay, 50ms)) backwards 1;
        }
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
