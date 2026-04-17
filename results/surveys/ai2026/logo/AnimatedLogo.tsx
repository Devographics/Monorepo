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
        <div className="sor-logo__wrapper">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width={600}
                height={600}
                className="sor-logo"
                viewBox="0 0 600 600"
                fill="none"
                strokeMiterlimit={10}
            >
                <title>{'State of React 2024'}</title>
                <defs>
                    <symbol id="sor-atom-ring-dash">
                        <path
                            data-ring="W-E"
                            d="M303.24 264.19c2.19.01 4.4.03 6.57.06l-1.87 7c-1.75-.03-3.54-.04-5.31-.05l.61-7.01Zm-6.57 0 .64 7.01c-1.77 0-3.56.03-5.32.05l-1.89-7c2.17-.03 4.38-.05 6.57-.06Zm19.7.19c2.18.05 4.38.12 6.53.19l-4.38 6.94c-1.74-.06-3.51-.11-5.27-.16l3.12-6.97Zm-32.84.01 3.16 6.97c-1.76.04-3.54.1-5.28.16l-4.4-6.93c2.15-.07 4.35-.14 6.52-.19Zm45.86.45c2.15.1 4.31.2 6.44.32l-6.88 6.82c-1.71-.09-3.46-.18-5.2-.26l5.63-6.89Zm-58.87 0 5.66 6.88c-1.73.08-3.48.17-5.19.26l-6.91-6.82c2.13-.12 4.29-.23 6.44-.32Zm71.69.71c2.11.14 4.23.29 6.3.45l-9.34 6.66c-1.67-.13-3.38-.25-5.08-.36l8.12-6.75Zm-84.51 0 8.15 6.75c-1.69.11-3.4.23-5.07.36l-9.37-6.66c2.08-.16 4.2-.31 6.3-.45Zm97.04.96c2.05.18 4.11.37 6.13.58l-11.74 6.45c-1.62-.16-3.29-.32-4.94-.46l10.55-6.56Zm-109.55.01 10.58 6.56c-1.64.15-3.3.3-4.92.46l-11.76-6.45c2-.2 4.05-.39 6.09-.57Zm121.7 1.2c1.97.22 3.95.46 5.89.7l-14.05 6.19c-1.56-.19-3.16-.38-4.75-.56l12.91-6.32Zm-133.79.01 12.92 6.32c-1.59.18-3.18.37-4.73.56l-14.06-6.19c1.93-.24 3.9-.47 5.87-.69Zm145.43 1.44c1.88.26 3.77.53 5.61.81l-16.25 5.89c-1.49-.22-3.01-.44-4.53-.65l15.16-6.04Zm-157.03.01 15.16 6.04c-1.52.21-3.04.43-4.52.65l-16.25-5.89c1.83-.28 3.72-.55 5.6-.81Zm168.1 1.67c1.78.3 3.56.6 5.29.92l-18.31 5.54c-1.4-.25-2.84-.5-4.28-.74l17.3-5.72Zm-179.15 0 17.29 5.72c-1.43.24-2.87.49-4.27.74l-18.31-5.55c1.73-.31 3.51-.62 5.29-.92Zm-10.4 1.89 19.29 5.36c-1.35.27-2.69.54-3.99.82l-20.25-5.16c1.61-.35 3.27-.69 4.94-1.02Zm199.97 0c1.66.33 3.33.67 4.94 1.02l-20.24 5.16c-1.3-.28-2.65-.56-3.99-.82l19.3-5.36Zm-209.66 2.08 21.16 4.96c-1.25.29-2.49.59-3.68.9l-22.03-4.75c1.48-.38 3.01-.75 4.56-1.11Zm219.35 0c1.55.36 3.08.74 4.55 1.11l-22.03 4.75c-1.19-.3-2.43-.61-3.68-.9l21.16-4.96Zm-228.26 2.27 22.87 4.52c-1.14.32-2.27.64-3.35.97l-23.66-4.29c1.33-.4 2.73-.81 4.14-1.2Zm237.16 0c1.41.39 2.8.79 4.14 1.2l-23.66 4.29c-1.08-.33-2.2-.65-3.34-.97l22.86-4.52Zm8.06 2.44c1.27.42 2.51.85 3.69 1.28l-25.13 3.81c-.95-.35-1.96-.69-2.98-1.03l24.41-4.06Zm-253.28 0 24.41 4.05c-1.02.34-2.03.69-2.99 1.03l-25.13-3.81c1.19-.43 2.43-.86 3.7-1.28Zm260.42 2.58c1.11.44 2.19.89 3.21 1.34l-26.41 3.3c-.83-.36-1.7-.73-2.6-1.08l25.79-3.56Zm-267.58.01 25.8 3.55a73 73 0 0 0-2.6 1.09l-26.41-3.3c1.03-.45 2.11-.91 3.22-1.35ZM440 284.83c.94.46 1.86.93 2.72 1.4l-27.51 2.76c-.69-.38-1.43-.76-2.19-1.13l26.98-3.03Zm-279.97.02 26.99 3.03c-.77.37-1.5.76-2.2 1.14l-27.52-2.76c.86-.47 1.77-.94 2.72-1.41Zm285.14 2.81c.78.48 1.52.97 2.2 1.46l-28.42 2.2c-.55-.39-1.15-.79-1.77-1.17l27.99-2.48Zm-290.33.03 28 2.48c-.62.38-1.22.78-1.77 1.17l-28.42-2.19c.69-.49 1.43-.98 2.2-1.46Zm294.47 2.9c.6.49 1.16.99 1.66 1.49l-29.11 1.62c-.41-.4-.86-.81-1.34-1.2l28.79-1.91Zm-298.6.04 28.8 1.91c-.48.4-.93.8-1.34 1.2l-29.12-1.62c.5-.5 1.06-1 1.66-1.49Zm301.65 2.96c.41.5.79 1.01 1.11 1.52l-29.6 1.04c-.26-.41-.56-.82-.9-1.23l29.38-1.33Zm-304.69.04 29.39 1.33c-.33.4-.63.82-.89 1.23l-29.6-1.03c.32-.51.69-1.02 1.11-1.52Zm306.63 3.01c.23.51.42 1.03.56 1.54l-29.87.45c-.11-.41-.26-.83-.45-1.24l29.76-.74Zm-308.56.04 29.76.73c-.19.41-.34.83-.45 1.24l-29.87-.44c.14-.51.32-1.03.55-1.53Z"
                        />
                    </symbol>
                    <mask id="sor-ring-mask-we-dash">
                        <rect fill="black" x={0} y={0} width="100%" height="100%" />
                        <path
                            pathLength={1}
                            stroke="white"
                            strokeWidth={160}
                            transform="rotate(0)"
                            d="M220.03,300.52c0,44.18,35.82,80,80,80s80-35.82,80-80-35.82-80-80-80-80,35.82-80,80"
                            className="sor-atom__ring-mask sor-atom__ring-mask--dash"
                            style={{
                                '--r': 1
                            }}
                        />
                    </mask>
                    <mask id="sor-ring-mask-nwse-dash">
                        <rect fill="black" x={0} y={0} width="100%" height="100%" />
                        <path
                            pathLength={1}
                            stroke="white"
                            strokeWidth={160}
                            transform="rotate(-120)"
                            d="M220.03,300.52c0,44.18,35.82,80,80,80s80-35.82,80-80-35.82-80-80-80-80,35.82-80,80"
                            className="sor-atom__ring-mask sor-atom__ring-mask--dash"
                            style={{
                                '--r': 1
                            }}
                        />
                    </mask>
                    <mask id="sor-ring-mask-nesw-dash">
                        <rect fill="black" x={0} y={0} width="100%" height="100%" />
                        <path
                            pathLength={1}
                            stroke="white"
                            strokeWidth={160}
                            transform="rotate(-60)"
                            d="M220.03,300.52c0,44.18,35.82,80,80,80s80-35.82,80-80-35.82-80-80-80-80,35.82-80,80"
                            className="sor-atom__ring-mask sor-atom__ring-mask--dash"
                            style={{
                                '--r': 2
                            }}
                        />
                    </mask>
                    <mask id="sor-ring-mask-we-fill">
                        <rect fill="black" x={0} y={0} width="100%" height="100%" />
                        <path
                            pathLength={1}
                            stroke="white"
                            strokeWidth={160}
                            transform="rotate(180)"
                            d="M220.03,300.52c0,44.18,35.82,80,80,80s80-35.82,80-80-35.82-80-80-80-80,35.82-80,80"
                            className="sor-atom__ring-mask sor-atom__ring-mask--fill"
                            style={{
                                '--r': 1
                            }}
                        />
                    </mask>
                    <mask id="sor-ring-mask-nwse-fill">
                        <rect fill="black" x={0} y={0} width="100%" height="100%" />
                        <path
                            pathLength={1}
                            stroke="white"
                            strokeWidth={160}
                            transform="rotate(60) translate(0 0.75)"
                            d="M220.03,300.52c0,44.18,35.82,80,80,80s80-35.82,80-80-35.82-80-80-80-80,35.82-80,80"
                            className="sor-atom__ring-mask sor-atom__ring-mask--fill"
                            style={{
                                '--r': 1
                            }}
                        />
                    </mask>
                    <mask id="sor-ring-mask-nesw-fill">
                        <rect fill="black" x={0} y={0} width="100%" height="100%" />
                        <path
                            pathLength={1}
                            stroke="white"
                            strokeWidth={160}
                            transform="rotate(120) translate(0 0.25)"
                            d="M220.03,300.52c0,44.18,35.82,80,80,80s80-35.82,80-80-35.82-80-80-80-80,35.82-80,80"
                            className="sor-atom__ring-mask sor-atom__ring-mask--fill"
                            style={{
                                '--r': 2
                            }}
                        />
                    </mask>
                </defs>
                <g className="sor-hex sor-hex--outer" data-hex="init" strokeWidth={2.87}>
                    <line
                        pathLength={1}
                        data-loc="t"
                        style={{
                            '--o': '0%'
                        }}
                        data-name="OTL"
                        x1={212}
                        y1={51.19}
                        x2={299.51}
                        y2={51.19}
                    />
                    <line
                        pathLength={1}
                        data-loc="t"
                        style={{
                            '--o': '100%'
                        }}
                        data-name="OTR"
                        x1={387.99}
                        y1={51.32}
                        x2={299.51}
                        y2={51.19}
                    />
                    <line
                        pathLength={1}
                        data-loc="b"
                        style={{
                            '--o': '0%'
                        }}
                        data-name="OBL"
                        x1={212}
                        y1={549.85}
                        x2={299.51}
                        y2={549.85}
                    />
                    <line
                        pathLength={1}
                        data-loc="b"
                        style={{
                            '--o': '100%'
                        }}
                        data-name="OBR"
                        x1={387.99}
                        y1={549.98}
                        x2={299.51}
                        y2={549.85}
                    />
                </g>
                <g className="sor-hex sor-hex--middle" data-hex="init" strokeWidth={1.91}>
                    <line
                        pathLength={1}
                        data-loc="t"
                        style={{
                            '--o': '0%'
                        }}
                        data-name="MTL"
                        x1={212}
                        y1={57.89}
                        x2={300.21}
                        y2={57.89}
                    />
                    <line
                        pathLength={1}
                        data-loc="t"
                        style={{
                            '--o': '100%'
                        }}
                        data-name="MTR"
                        x1={387.99}
                        y1={57.89}
                        x2={299.93}
                        y2={57.89}
                    />
                    <line
                        pathLength={1}
                        data-loc="b"
                        style={{
                            '--o': '0%'
                        }}
                        data-name="MBL"
                        x1={212}
                        y1={543.16}
                        x2={300.21}
                        y2={543.16}
                    />
                    <line
                        pathLength={1}
                        data-loc="b"
                        style={{
                            '--o': '100%'
                        }}
                        data-name="MBR"
                        x1={387.99}
                        y1={543.16}
                        x2={299.93}
                        y2={543.16}
                    />
                </g>
                <g className="sor-hex sor-hex--inner" data-hex="init" strokeWidth={1.91}>
                    <line
                        pathLength={1}
                        data-loc="t"
                        style={{
                            '--o': '0%'
                        }}
                        data-name="ITL"
                        x1={212}
                        y1={64.58}
                        x2={300.21}
                        y2={64.58}
                    />
                    <line
                        pathLength={1}
                        data-loc="t"
                        style={{
                            '--o': '100%'
                        }}
                        data-name="ITR"
                        x1={387.99}
                        y1={64.58}
                        x2={300.21}
                        y2={64.58}
                    />
                    <line
                        pathLength={1}
                        data-loc="b"
                        style={{
                            '--o': '0%'
                        }}
                        data-name="IBL"
                        x1={212}
                        y1={536.47}
                        x2={300.21}
                        y2={536.47}
                    />
                    <line
                        pathLength={1}
                        data-loc="b"
                        style={{
                            '--o': '100%'
                        }}
                        data-name="IBR"
                        x1={387.99}
                        y1={536.47}
                        x2={300.21}
                        y2={536.47}
                    />
                </g>
                <g>
                    <g className="sor-hex sor-hex--inner" data-hex="frame" strokeWidth={1.91}>
                        <path
                            pathLength={1}
                            data-name="NE"
                            style={{
                                '--d': -1
                            }}
                            d="m48.41 336.65-20.86-36.13 20.78-35.99 94.59-163.82 20.86-36.13h48.48"
                        />
                        <path
                            pathLength={1}
                            data-name="SW"
                            style={{
                                '--d': -1
                            }}
                            d="M212.34 536.47h-48.57l-20.78-35.99"
                        />
                        <path
                            pathLength={1}
                            data-name="SE"
                            style={{
                                '--d': -1
                            }}
                            d="m551.58 264.4 20.86 36.13-20.77 35.99-94.59 163.82-20.86 36.13h-48.46"
                        />
                        <path
                            pathLength={1}
                            data-name="NE"
                            style={{
                                '--d': 1
                            }}
                            d="M387.52 64.58h48.7L457 100.57"
                        />
                    </g>
                    <g className="sor-hex sor-hex--middle" data-hex="frame" strokeWidth={1.91}>
                        <path
                            pathLength={1}
                            data-name="L"
                            style={{
                                '--d': -1
                            }}
                            d="M212.34 543.16h-52.43L19.82 300.52 159.91 57.89h52.35"
                        />
                        <path
                            pathLength={1}
                            data-name="R"
                            style={{
                                '--d': -1
                            }}
                            d="M387.75 543.16h52.34l140.08-242.64L440.09 57.89h-52.56"
                        />
                    </g>
                    <g className="sor-hex sor-hex--outer" data-hex="frame" strokeWidth={2.87}>
                        <path
                            pathLength={1}
                            data-name="NW"
                            style={{
                                '--d': 1
                            }}
                            d="M212.26 51.19h-56.21l-31.68 54.87"
                        />
                        <path
                            pathLength={1}
                            data-name="W-SW"
                            style={{
                                '--d': 1
                            }}
                            data-hex="wait"
                            d="m43.55 245.78-31.57 54.68 31.68 54.87 80.59 139.85 31.57 54.68h56.51"
                        />
                        <path
                            pathLength={1}
                            data-name="SE"
                            style={{
                                '--d': -1
                            }}
                            data-hex="wait"
                            d="M387.75 549.98h55.98l31.68-54.87"
                        />
                        <path
                            pathLength={1}
                            data-name="E-NE"
                            style={{
                                '--d': -1
                            }}
                            d="m556.22 355.39 31.57-54.68-31.68-54.87-80.6-139.85-31.57-54.68h-56.43"
                        />
                    </g>
                </g>
                <g className="sor-atom">
                    <g id="DASH-RINGS">
                        <g className="sor-atom__ring-wrap" mask="url(#sor-ring-mask-we-dash)">
                            <g transform="rotate(0)">
                                <use
                                    xlinkHref="#sor-atom-ring-dash"
                                    className="sor-atom__ring sor-atom__ring--dash"
                                    style={{
                                        '--r': 0
                                    }}
                                />
                            </g>
                            <g transform="rotate(180) translate(0 1)">
                                <use
                                    xlinkHref="#sor-atom-ring-dash"
                                    className="sor-atom__ring sor-atom__ring--dash"
                                    style={{
                                        '--r': 0
                                    }}
                                />
                            </g>
                        </g>
                        <g className="sor-atom__ring-wrap" mask="url(#sor-ring-mask-nesw-dash)">
                            <g transform="rotate(-60)">
                                <use
                                    xlinkHref="#sor-atom-ring-dash"
                                    className="sor-atom__ring sor-atom__ring--dash"
                                    style={{
                                        '--r': 1
                                    }}
                                />
                            </g>
                            <g transform="rotate(120) translate(0 0.5) ">
                                <use
                                    xlinkHref="#sor-atom-ring-dash"
                                    className="sor-atom__ring sor-atom__ring--dash"
                                    style={{
                                        '--r': 1
                                    }}
                                />
                            </g>
                        </g>
                        <g className="sor-atom__ring-wrap" mask="url(#sor-ring-mask-nwse-dash)">
                            <g transform="rotate(-120)">
                                <use
                                    xlinkHref="#sor-atom-ring-dash"
                                    className="sor-atom__ring sor-atom__ring--dash"
                                    style={{
                                        '--r': 2
                                    }}
                                />
                            </g>
                            <g transform="rotate(60) translate(0 0.5)">
                                <use
                                    xlinkHref="#sor-atom-ring-dash"
                                    className="sor-atom__ring sor-atom__ring--dash"
                                    style={{
                                        '--r': 2
                                    }}
                                />
                            </g>
                        </g>
                    </g>
                    <circle className="sor-atom__nucleus" cx={300.03} cy={300.52} r={20.9} />
                    <g id="FULL-RINGS">
                        <g className="sor-atom__ring-wrap" mask="url(#sor-ring-mask-we-fill)">
                            <g
                                className="sor-atom__ring sor-atom__ring--fill"
                                style={{
                                    '--r': 0
                                }}
                            >
                                <path d="M345.69 327.87c-14.36 1.32-29.78 2.01-45.66 2.01-33.45 0-64.9-3.05-88.55-8.59-23.64-5.54-36.67-12.9-36.69-20.74h-29.9c.02 9.69 16.15 18.81 45.43 25.67 29.3 6.86 68.26 10.65 109.7 10.65 16.86 0 33.3-.64 48.86-1.84-1.03-2.36-2.09-4.74-3.2-7.15Z" />
                                <path d="M425.27 300.55c-.02 7.84-13.05 15.2-36.69 20.74-9.58 2.24-20.45 4.07-32.2 5.46 1.16 2.46 2.31 4.9 3.41 7.32 18.44-1.8 35.39-4.45 49.94-7.86 29.28-6.86 45.41-15.97 45.43-25.67h-29.9Z" />
                            </g>
                        </g>
                        <g className="sor-atom__ring-wrap" mask="url(#sor-ring-mask-nwse-fill)">
                            <g
                                className="sor-atom__ring sor-atom__ring--fill"
                                style={{
                                    '--r': 1
                                }}
                            >
                                <path d="M241.43 191.06c5.14 0 14.91 3.89 32.29 22.4 16.63 17.71 34.99 43.42 51.72 72.39 2.55 4.42 5.01 8.83 7.38 13.22 1.33-2.49 2.63-4.98 3.9-7.45-1.72-3.08-3.45-6.17-5.24-9.26-20.72-35.89-43.48-67.74-64.07-89.68-17.04-18.15-30.86-27.75-39.97-27.75-1.87 0-3.54.42-4.97 1.24l14.95 25.89c1.16-.66 2.51-1 4.02-1Z" />
                                <path d="M342.35 301.96c-1.34 2.49-2.7 4.98-4.09 7.48 10.58 20.68 18.89 40.5 24 57.4 7.03 23.25 7.16 38.21.38 42.15l14.95 25.89c8.39-4.86 8.21-23.39-.49-52.18-7.12-23.55-19.25-51.66-34.76-80.73Z" />
                            </g>
                        </g>
                        <g className="sor-atom__ring-wrap" mask="url(#sor-ring-mask-nesw-fill)">
                            <g
                                className="sor-atom__ring sor-atom__ring--fill"
                                style={{
                                    '--r': 2
                                }}
                            >
                                <path d="M326.06 327.87c1.82-3.04 3.62-6.1 5.41-9.2 20.72-35.89 36.93-71.52 45.63-100.33 8.7-28.79 8.87-47.32.49-52.18l-14.95 25.89c6.78 3.93 6.64 18.9-.38 42.14-7.03 23.25-20.11 52.01-36.83 80.98-2.56 4.43-5.16 8.78-7.78 13.04 2.83-.09 5.63-.21 8.41-.35Z" />
                                <path d="M311.4 338.12c-12.62 19.49-25.61 36.59-37.69 49.45-17.38 18.52-27.15 22.4-32.29 22.4-1.51 0-2.86-.34-4.02-1l-14.95 25.89c1.43.82 3.1 1.24 4.97 1.24 9.11 0 22.94-9.6 39.97-27.75 16.83-17.93 35.1-42.48 52.52-70.43-2.83.08-5.67.15-8.52.2Z" />
                            </g>
                        </g>
                    </g>
                </g>
                <g>
                    <g
                        className="sor-title-group sor-title-group--stroke sor-title--katakana"
                        strokeWidth={6.6}
                    >
                        <path
                            data-name="TO"
                            d="m469.22 440.28-18.29 31.67h-29.11v47.09h-31.47v-94.17l31.47-17.69v33.1h47.4z"
                            style={{
                                '--l': 5
                            }}
                        />
                        <path
                            data-name="KU"
                            d="m326.94 409.34-27.13 47.21 27.28 15.67 9.14-15.9h16.51l-27.15 46.99 27.25 15.73 33.58-58.11v-36.06h-32.57l-26.91-15.53z"
                            style={{
                                '--l': 3.75
                            }}
                        />
                        <path
                            data-name="A"
                            d="m295.21 457.79 1.67-2.92 17.25-30h-83.68v31.45h55.07v15.34h-31.27v15.28l-9.73 17.02 27.32 15.61 13.88-24.27v-23.25h13.44l5.16-9.02-6.19-3.56-2.92-1.68z"
                            style={{
                                '--l': 2.5
                            }}
                        />
                        <path
                            data-name="RI"
                            d="M179.31 471.66h-31.47v-64.48l31.47 17.69v46.79Zm15.74-46.79v47.16l-18.82 31.46 27.01 16.14 23.27-38.92v-55.85l-31.47-17.69v17.69Z"
                            style={{
                                '--l': 1.25
                            }}
                        />
                    </g>
                    <g
                        className="sor-title-group sor-title-group--stroke sor-title--latin"
                        strokeWidth={6.6}
                    >
                        <path
                            data-name="T"
                            d="M437.23 119.78h-23.11V97.57h72.47v22.21h-23.11v56.31h-26.25v-56.31z"
                            style={{
                                '--l': 5
                            }}
                        />
                        <path
                            data-name="C"
                            d="M376.1 177.77c-5.46 0-10.64-.97-15.54-2.92-4.9-1.94-9.22-4.71-12.96-8.3-3.74-3.59-6.71-7.89-8.92-12.9-2.21-5.01-3.31-10.54-3.31-16.6v-.22c0-5.83 1.07-11.25 3.2-16.26 2.13-5.01 5.08-9.35 8.86-13.01 3.78-3.66 8.21-6.52 13.29-8.58 5.08-2.06 10.54-3.09 16.38-3.09 4.34 0 8.32.5 11.95 1.51 3.63 1.01 6.92 2.41 9.87 4.21 2.95 1.79 5.57 3.95 7.85 6.45 2.28 2.51 4.24 5.25 5.89 8.24l-21.65 12.67c-1.5-2.84-3.35-5.14-5.55-6.9-2.21-1.76-5.1-2.64-8.69-2.64-2.24 0-4.26.45-6.06 1.35-1.79.9-3.33 2.13-4.6 3.7-1.27 1.57-2.26 3.4-2.97 5.5-.71 2.09-1.07 4.3-1.07 6.62v.22c0 2.54.35 4.88 1.07 7.01.71 2.13 1.72 3.96 3.03 5.5 1.31 1.53 2.86 2.73 4.66 3.59 1.79.86 3.78 1.29 5.95 1.29 3.74 0 6.73-.92 8.97-2.75s4.19-4.21 5.83-7.12l21.65 12.23a50.217 50.217 0 0 1-5.83 8.24c-2.24 2.58-4.88 4.82-7.91 6.73s-6.47 3.42-10.32 4.54c-3.85 1.12-8.21 1.68-13.07 1.68Z"
                            style={{
                                '--l': 4
                            }}
                        />
                        <path
                            data-name="A"
                            d="M313.22 97.01H287.2l-33.09 79.08h28.04l4.04-10.54h27.48l4.15 10.54h28.49l-33.09-79.08Zm-20.41 49.91 7.18-19.07 7.18 19.07h-14.36Z"
                            style={{
                                '--l': 3
                            }}
                        />
                        <path
                            data-name="E"
                            d="M259.48 154.55h-40.23v-8.53h38.37v-18.95h-38.37v-7.97h41.17V97.57h-66.96v78.52h57l9.02-21.54z"
                            style={{
                                '--l': 2
                            }}
                        />
                        <path
                            data-name="R"
                            d="M175.84 149.39c4.78-2.32 8.56-5.46 11.33-9.42 2.77-3.96 4.15-8.82 4.15-14.58v-.23c0-4.04-.6-7.55-1.8-10.54-1.2-2.99-2.99-5.68-5.38-8.08-2.77-2.77-6.41-4.95-10.94-6.56-4.53-1.61-10.3-2.41-17.33-2.41h-38.36v78.52h26.25v-22.43h5.61l14.81 22.43h29.95l-18.28-26.7Zm-10.65-22.1c0 2.39-.9 4.26-2.69 5.61-1.79 1.35-4.26 2.02-7.4 2.02h-11.33v-15.37h11.44c3.07 0 5.5.62 7.29 1.85s2.69 3.12 2.69 5.66v.23Z"
                            style={{
                                '--l': 1
                            }}
                        />
                    </g>
                    <g className="sor-title-group sor-title-group--fill sor-title--katakana">
                        <path
                            data-name="TO"
                            d="m469.22 440.28-18.29 31.67h-29.11v47.09h-31.47v-94.17l31.47-17.69v33.1h47.4z"
                            style={{
                                '--l': 5
                            }}
                        />
                        <path
                            data-name="KU"
                            d="m326.94 409.34-27.13 47.21 27.28 15.67 9.14-15.9h16.51l-27.15 46.99 27.25 15.73 33.58-58.11v-36.06h-32.57l-26.91-15.53z"
                            style={{
                                '--l': 3.75
                            }}
                        />
                        <path
                            data-name="A"
                            d="m295.21 457.79 1.67-2.92 17.25-30h-83.68v31.45h55.07v15.34h-31.27v15.28l-9.73 17.02 27.32 15.61 13.88-24.27v-23.25h13.44l5.16-9.02-6.19-3.56-2.92-1.68z"
                            style={{
                                '--l': 2.5
                            }}
                        />
                        <path
                            data-name="RI"
                            d="M179.31 471.66h-31.47v-64.48l31.47 17.69v46.79Zm15.74-46.79v47.16l-18.82 31.46 27.01 16.14 23.27-38.92v-55.85l-31.47-17.69v17.69Z"
                            style={{
                                '--l': 1.25
                            }}
                        />
                    </g>
                    <g className="sor-title-group sor-title-group--fill sor-title--latin">
                        <path
                            data-name="T"
                            d="M437.23 119.78h-23.11V97.57h72.47v22.21h-23.11v56.31h-26.25v-56.31z"
                            style={{
                                '--l': 5
                            }}
                        />
                        <path
                            data-name="C"
                            d="M376.1 177.77c-5.46 0-10.64-.97-15.54-2.92-4.9-1.94-9.22-4.71-12.96-8.3-3.74-3.59-6.71-7.89-8.92-12.9-2.21-5.01-3.31-10.54-3.31-16.6v-.22c0-5.83 1.07-11.25 3.2-16.26 2.13-5.01 5.08-9.35 8.86-13.01 3.78-3.66 8.21-6.52 13.29-8.58 5.08-2.06 10.54-3.09 16.38-3.09 4.34 0 8.32.5 11.95 1.51 3.63 1.01 6.92 2.41 9.87 4.21 2.95 1.79 5.57 3.95 7.85 6.45 2.28 2.51 4.24 5.25 5.89 8.24l-21.65 12.67c-1.5-2.84-3.35-5.14-5.55-6.9-2.21-1.76-5.1-2.64-8.69-2.64-2.24 0-4.26.45-6.06 1.35-1.79.9-3.33 2.13-4.6 3.7-1.27 1.57-2.26 3.4-2.97 5.5-.71 2.09-1.07 4.3-1.07 6.62v.22c0 2.54.35 4.88 1.07 7.01.71 2.13 1.72 3.96 3.03 5.5 1.31 1.53 2.86 2.73 4.66 3.59 1.79.86 3.78 1.29 5.95 1.29 3.74 0 6.73-.92 8.97-2.75s4.19-4.21 5.83-7.12l21.65 12.23a50.217 50.217 0 0 1-5.83 8.24c-2.24 2.58-4.88 4.82-7.91 6.73s-6.47 3.42-10.32 4.54c-3.85 1.12-8.21 1.68-13.07 1.68Z"
                            style={{
                                '--l': 4
                            }}
                        />
                        <path
                            data-name="A"
                            d="M313.22 97.01H287.2l-33.09 79.08h28.04l4.04-10.54h27.48l4.15 10.54h28.49l-33.09-79.08Zm-20.41 49.91 7.18-19.07 7.18 19.07h-14.36Z"
                            style={{
                                '--l': 3
                            }}
                        />
                        <path
                            data-name="E"
                            d="M259.48 154.55h-40.23v-8.53h38.37v-18.95h-38.37v-7.97h41.17V97.57h-66.96v78.52h57l9.02-21.54z"
                            style={{
                                '--l': 2
                            }}
                        />
                        <path
                            data-name="R"
                            d="M175.84 149.39c4.78-2.32 8.56-5.46 11.33-9.42 2.77-3.96 4.15-8.82 4.15-14.58v-.23c0-4.04-.6-7.55-1.8-10.54-1.2-2.99-2.99-5.68-5.38-8.08-2.77-2.77-6.41-4.95-10.94-6.56-4.53-1.61-10.3-2.41-17.33-2.41h-38.36v78.52h26.25v-22.43h5.61l14.81 22.43h29.95l-18.28-26.7Zm-10.65-22.1c0 2.39-.9 4.26-2.69 5.61-1.79 1.35-4.26 2.02-7.4 2.02h-11.33v-15.37h11.44c3.07 0 5.5.62 7.29 1.85s2.69 3.12 2.69 5.66v.23Z"
                            style={{
                                '--l': 1
                            }}
                        />
                    </g>
                </g>
                <g>
                    <g className="sor-text sor-text--stateof">
                        <text x={300} y={70} fontSize={45} textAnchor="middle">
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
                    <g className="sor-text sor-text--year">
                        <text x={300} y={555} fontSize={45} textAnchor="middle">
                            <tspan data-year-char={1}>{'2'}</tspan>
                            <tspan data-year-char={2}>{'0'}</tspan>
                            <tspan data-year-char={3}>{'2'}</tspan>
                            <tspan data-year-char={4}>{'4'}</tspan>
                        </text>
                    </g>
                </g>
            </svg>
        </div>
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
    @font-face {
        font-family: 'Bebas Neue';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url(./BebasNeue-STATEOFDIGITS.woff2) format('woff2');
    }

    .sor-logo__wrapper {
        --color-text-a: #ffeb66;
        --color-text-b: #95f5e8;
        --color-bg: #182c36;
        --timeline-base-delay: 100ms;
        --timeline-hex-init-anim: 250ms;
        --timeline-hex-init-delay: 50ms;
        --timeline-hex-path-anim: 800ms;
        --timeline-hex-path-delay: calc(
            var(--timeline-hex-init-anim) + var(--timeline-hex-init-delay)
        );
        --timeline-nucleus-anim: 1000ms;
        --timeline-nucleus-delay: calc(
            var(--timeline-hex-path-anim) + var(--timeline-hex-path-delay)
        );
        --timeline-ring-anim: 1000ms;
        --timeline-ring-delay: calc(var(--timeline-nucleus-delay) + var(--timeline-base-delay));
        --timeline-text-anim: 1200ms;
        --timeline-text-delay-stateof: calc(
            var(--timeline-ring-anim) / 2 + var(--timeline-ring-delay)
        );
        --timeline-text-delay-year: calc(var(--timeline-title-delay) + var(--timeline-title-anim));
        --timeline-title-anim: 700ms;
        --timeline-title-delay: calc(
            var(--timeline-text-delay-stateof) + var(--timeline-text-anim) / 4
        );
        --ease-whisk-in: cubic-bezier(0.85, 0, 1, 1);
        --ease-whisk-out: cubic-bezier(0, 1, 0.15, 1);
        --ease-whisk-in-out: cubic-bezier(0.85, 0, 0.15, 1);
        --ease-soft-out: cubic-bezier(0, 0, 0.15, 1);
        --ease-circ-in: cubic-bezier(0, 0, 1, 0);
        --ease-circ-out: cubic-bezier(0, 0, 0, 1);
        --ease-more-circ-out: cubic-bezier(0, 0.5, 0, 1);
        --ease-bouncy-out: cubic-bezier(0.6, 1.5, 0.4, 1);
        --ease-bouncy-out: cubic-bezier(0.47, 1.97, 0, 0.71);
        --ease-bouncy-in-out: cubic-bezier(0.25, -0.25, 0.1, 1.25);
        --ease-true-bounce-out: cubic-bezier(0.47, 1.97, 0, 0.71);
        --ease-linear-soft-in: cubic-bezier(0.5, 0, 0.5, 0.5);
        --ease-linear-soft-out: cubic-bezier(0.5, 0.5, 0.5, 1);
        background: var(--color-bg);
    }

    @supports (transition-timing-function: linear(0.1 1%, 0.9 99%)) {
        .sor-logo__wrapper {
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
    .sor-logo__wrapper {
        position: relative;
        display: grid;
        width: 100vmin;
        max-width: 600px;
        aspect-ratio: 1;
        margin: auto;
    }

    .sor-logo {
        width: 100%;
        height: auto;
    }

    .sor-logo * {
        transform-box: fill-box;
        transform-origin: 50% 50%;
    }

    .sor-hex[data-hex='init'] line {
        stroke-dasharray: 1 1;
        animation: lineIn var(--timeline-hex-init-anim) var(--init-ease) var(--hex-delay, 0s) 1 both,
            scaleXOut calc(var(--timeline-text-anim) / 4) var(--ease-whisk-in-out)
                var(--end-anim-delay) 1 forwards;
    }

    .sor-hex[data-hex='init'] [data-loc='t'] {
        --d: -1;
        --init-ease: var(--ease-linear-soft-in);
        --hex-delay: var(--timeline-hex-init-delay);
        --end-anim-delay: var(--timeline-text-delay-stateof);
        transform-origin: var(--o, 50%) 50%;
    }

    .sor-hex[data-hex='init'] [data-loc='b'] {
        --d: 1;
        --init-ease: var(--ease-circ-out);
        --hex-delay: calc(var(--timeline-hex-path-anim) + var(--timeline-hex-path-delay));
        --end-anim-delay: var(--timeline-text-delay-year);
        transform-origin: calc(100% - var(--o, 50%)) 50%;
        animation-duration: calc(var(--timeline-hex-init-anim) * 2);
    }

    .sor-hex[data-hex='frame'] path {
        stroke-dasharray: 1 1;
        animation: lineIn calc(var(--timeline-hex-path-anim) - var(--w, 0s)) linear
            calc(var(--hex-delay, 0s) + var(--w, 0s)) 1 both;
        animation-timing-function: cubic-bezier(0.33, 1, 1, 1);
        animation-timing-function: var(--ease-linear-soft-out);
    }

    .sor-hex[data-hex='frame'] path[data-hex='wait'] {
        --w: calc(var(--timeline-hex-path-anim) * 0.75);
    }

    .sor-hex--outer {
        --hex-delay: calc(var(--timeline-hex-path-delay) * 1);
        stroke: var(--color-text-b);
    }

    .sor-hex--middle {
        --hex-delay: calc(var(--timeline-hex-path-delay) * 1);
        stroke: var(--color-text-b);
    }

    .sor-hex--inner {
        --hex-delay: calc(var(--timeline-hex-path-delay) * 1);
        stroke: var(--color-text-a);
    }

    .sor-atom__nucleus {
        fill: var(--color-text-b);
        animation: scaleIn var(--timeline-nucleus-anim) var(--ease-true-bounce-out)
            var(--timeline-nucleus-delay) 1 backwards;
    }

    .sor-atom__ring {
        transform-box: view-box;
    }

    .sor-atom__ring-mask {
        --stagger: 50ms;
        --d2: -0.5;
        --delay: calc(var(--timeline-ring-delay) + var(--r, 0) * var(--stagger));
        stroke-dasharray: 1 1;
        stroke-dashoffset: var(--d2);
        animation: lineIn var(--timeline-ring-anim) ease-in-out var(--delay) 1 backwards;
    }

    .sor-atom__ring-mask--dash {
        --d: 1;
        animation-name: specialLineInMask;
        animation-timing-function: cubic-bezier(0.75, 0, 0.25, 1);
    }

    .sor-atom__ring-mask--fill {
        --d: 0.5;
        --d2: 0;
        animation-timing-function: var(--ease-linear-soft-out);
        animation-duration: calc(var(--timeline-ring-anim) / 2);
        animation-delay: calc(var(--timeline-ring-anim) / 2 + var(--delay));
    }

    .sor-atom__ring-mask,
    .sor-atom__ring-wrap [transform] {
        transform-origin: unset;
        transform-box: view-box;
    }

    .sor-atom__ring--dash {
        fill: var(--color-text-a);
    }

    .sor-atom__ring--fill {
        fill: var(--color-text-b);
    }

    .sor-title {
        transform-box: view-box;
    }

    .sor-title-group path {
        --rel-letter-delay: calc(3 - var(--l));
        --letter-delay: max(var(--rel-letter-delay) * -1, var(--rel-letter-delay));
        transform-box: view-box;
        animation: scaleIn var(--timeline-title-anim) var(--ease-whisk-out)
            calc(var(--timeline-title-delay) + var(--letter-delay) * 42ms + var(--extra-delay, 0ms))
            1 backwards;
    }

    .sor-title-group--stroke {
        --extra-delay: 50ms;
        fill: var(--color-bg);
        stroke: var(--color-bg);
    }

    .sor-title-group--fill.sor-title--katakana {
        fill: var(--color-text-a);
    }

    .sor-title-group--fill.sor-title--latin {
        fill: var(--color-text-b);
    }

    .sor-text {
        --init-scaleY: 1;
        font-family: 'Bebas Neue', 'BebasNeue', 'BebasNeueBold', 'Bebas', Helvetica, sans-serif;
        font-weight: 400;
        fill: var(--color-text-b);
        will-change: transform;
        animation: textIn var(--timeline-text-anim) var(--ease-true-bounce-out) 1 backwards,
            fadeIn var(--timeline-text-anim) ease-out 1 backwards;
    }

    .sor-text * {
        font-family: inherit;
    }

    .sor-text--stateof {
        fill: var(--color-text-a);
        letter-spacing: 0.01em;
        animation-delay: var(--timeline-text-delay-stateof);
    }

    .sor-text--year {
        --init-scaleX: 1.5;
        letter-spacing: 0.45em;
        animation-delay: var(--timeline-text-delay-year);
    }

    @keyframes scaleIn {
        from {
            transform: scale(var(--init-scaleX, 0.0001), var(--init-scaleY, 0.0001));
        }
    }
    @keyframes scaleXOut {
        to {
            transform: scaleX(0.0001);
        }
    }
    @keyframes specialLineInMask {
        0% {
            stroke-dashoffset: var(--d);
        }
        25% {
            animation-timing-function: cubic-bezier(1, 0.5, 0.25, 1);
        }
        50% {
            stroke-dashoffset: 0;
            animation-timing-function: var(--ease-linear-soft-out);
        }
    }
    @keyframes lineIn {
        from {
            stroke-dashoffset: var(--d, -1);
        }
    }
    @keyframes textIn {
        from {
            transform: scale(var(--init-scaleX, 0.5), var(--init-scaleY, 0.5));
        }
    }
    @keyframes fadeIn {
        from {
            filter: opacity(0%);
            opacity: 0;
        }
    }
`

const LogoSVG = styled.svg``

export default Logo
