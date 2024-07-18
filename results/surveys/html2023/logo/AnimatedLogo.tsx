import React from 'react'
import styled, { keyframes } from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'

interface LogoProps {
    className?: string
    animated?: boolean
    size?: string
    showText?: boolean
}

const style = `
    
@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&amp;display=swap&amp;text=STATEOF0123456789");
      
.soh-logo {
  --color-text: #9f0d47;
  --color-bg: #4a564b;
  --color-slash-one-a: #52b384;
  --color-slash-one-b: #1595e7;
  --color-slash-one-c: #953dff;
  --color-slash-two-a: #5f9b9d;
  --color-slash-two-b: #228ce9;
  --color-slash-two-c: #4872f1;
  --color-slash-two-d: #8855e6;
  --color-slash-three-a: #6d84b5;
  --color-slash-three-b: #2f83ec;
  --color-slash-three-c: #3b7bee;
  --color-slash-three-d: #7a6cce;
  --color-chevron-back-a: #9f0d47;
  --color-chevron-back-b: #190941;
  --color-chevron-front-a: #e02d2d;
  --color-chevron-front-b: #fff873;
  --color-grad-shape-a: #fff6e6;
  --color-grad-shape-b: #ffdea4;
  --color-shape-shadow-bg: #040823;
  --color-shape-shadow-stroke: #f7b457;
  --timeline-base-delay: 100ms;
  --timeline-chevron-front-anim: 600ms;
  --timeline-chevron-front-delay: var(--timeline-base-delay);
  --timeline-chevron-back-anim: calc(var(--timeline-chevron-front-anim) * 0.75);
  --timeline-chevron-back-delay: calc(var(--timeline-chevron-front-delay) + var(--timeline-chevron-front-anim) * 0.75);
  --timeline-slash-anim: 600ms;
  --timeline-slash-delay: calc(var(--timeline-chevron-back-delay) + var(--timeline-slash-anim) * 0.25);
  --timeline-slash-sub-delay: 250ms;
  --timeline-shape-shadow-bg-delay: var(--timeline-slash-delay);
  --timeline-shape-shadow-bg-anim: 800ms;
  --timeline-shape-shadow-stroke-delay: calc(var(--timeline-shape-shadow-bg-delay) + var(--timeline-shape-shadow-bg-anim) * 0.75);
  --timeline-shape-shadow-stroke-anim: 1200ms;
  --timeline-shape-fill-delay: calc(var(--timeline-shape-shadow-stroke-delay) + var(--timeline-shape-shadow-stroke-anim));
  --timeline-shape-fill-anim: 1200ms;
  --timeline-text-anim: 1200ms;
  --timeline-text-delay: calc(var(--timeline-shape-fill-delay) + var(--timeline-shape-fill-anim));
  --ease-whisk-out: cubic-bezier(0, 1, 0.15, 1);
  --ease-whisk-in-out: cubic-bezier(0.85, 0, 0.15, 1);
  --ease-soft-out: cubic-bezier(0, 0, 0.15, 1);
  --ease-circ-in: cubic-bezier(0, 0, 1, 0);
  --ease-circ-out: cubic-bezier(0, 0, 0, 1);
  --ease-more-circ-out: cubic-bezier(0,0.5,0,1);
  --ease-bouncy-out: cubic-bezier(0.6, 1.5, 0.4, 1);
  --ease-bouncy-out: cubic-bezier(.47,1.97,0,.71);
  --ease-bouncy-in-out: cubic-bezier(0.25, -0.25, 0.1, 1.25);
  --ease-true-bounce-out: linear(
     0, 0.218 2.1%, 0.862 6.5%, 1.114, 1.296 10.7%, 1.346, 1.37 12.9%, 1.373,
     1.364 14.5%, 1.315 16.2%, 1.032 21.8%, 0.941 24%, 0.891 25.9%, 0.877,
     0.869 27.8%, 0.87, 0.882 30.7%, 0.907 32.4%, 0.981 36.4%, 1.012 38.3%, 1.036,
     1.046 42.7% 44.1%, 1.042 45.7%, 0.996 53.3%, 0.988, 0.984 57.5%, 0.985 60.7%,
     1.001 68.1%, 1.006 72.2%, 0.998 86.7%, 1
   );
  --ease-linear-soft-out: cubic-bezier(.5,.5,.5,1);
  /* background: var(--color-bg); */
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
  -webkit-animation: angleSlideIn var(--timeline-slash-anim) var(--ease-whisk-out) calc(var(--timeline-slash-delay) + var(--timeline-slash-sub-delay) 				* (var(--sub-count) - var(--subindex)) 			) backwards 1;
          animation: angleSlideIn var(--timeline-slash-anim) var(--ease-whisk-out) calc(var(--timeline-slash-delay) + var(--timeline-slash-sub-delay) 				* (var(--sub-count) - var(--subindex)) 			) backwards 1;
}
.soh-slash--a, .soh-slash--f { --subindex: 1; }
.soh-slash--b, .soh-slash--e { --subindex: 2; }
.soh-slash--c, .soh-slash--d { --subindex: 3; }
.soh-slashes > :nth-child(n+4) {
  --dir: -1;
}

.soh-back-chevron {
  --dir: 1;
  --angle: calc(29deg + 180deg);
  --offset: 909px;
  --starting-opacity: 1;
  -webkit-animation: angleSlideIn var(--timeline-chevron-back-anim) var(--ease-linear-soft-out) var(--timeline-chevron-back-delay) backwards 1;
          animation: angleSlideIn var(--timeline-chevron-back-anim) var(--ease-linear-soft-out) var(--timeline-chevron-back-delay) backwards 1;
}
.soh-back-chevron--left {
  --dir: -1;
}

.soh-front-chevron {
  --dir: 1;
  --angle: 29deg;
  --offset: 909px;
  --starting-opacity: 1;
  -webkit-animation: angleSlideIn var(--timeline-chevron-front-anim) var(--ease-circ-in, linear) var(--timeline-chevron-front-delay) backwards 1;
          animation: angleSlideIn var(--timeline-chevron-front-anim) var(--ease-circ-in, linear) var(--timeline-chevron-front-delay) backwards 1;
}
.soh-front-chevron--right {
  --dir: -1;
}

.soh-shape--shadow-bg {
  -webkit-animation: scaleIn var(--timeline-shape-shadow-bg-anim) var(--ease-bouncy-in-out) var(--timeline-shape-shadow-bg-delay) backwards 1;
          animation: scaleIn var(--timeline-shape-shadow-bg-anim) var(--ease-bouncy-in-out) var(--timeline-shape-shadow-bg-delay) backwards 1;
  -webkit-animation-timing-function: var(--ease-true-bounce-out);
          animation-timing-function: var(--ease-true-bounce-out);
}
.soh-shape--shadow-stroke {
  stroke-dasharray: 1 1;
  stroke-dashoffset: 0;
  -webkit-animation: lineIn var(--timeline-shape-shadow-stroke-anim) var(--ease-soft-out) var(--timeline-shape-shadow-stroke-delay) backwards 1;
          animation: lineIn var(--timeline-shape-shadow-stroke-anim) var(--ease-soft-out) var(--timeline-shape-shadow-stroke-delay) backwards 1;
}
.soh-shape--fill {
  -webkit-animation: fadeIn var(--timeline-shape-fill-anim) var(--ease-circ-out) var(--timeline-shape-fill-delay) backwards 1, untranslateIn var(--timeline-shape-fill-anim) var(--ease-circ-out) calc(var(--timeline-shape-fill-anim) / 3 + var(--timeline-shape-fill-delay)) backwards 1;
          animation: fadeIn var(--timeline-shape-fill-anim) var(--ease-circ-out) var(--timeline-shape-fill-delay) backwards 1, untranslateIn var(--timeline-shape-fill-anim) var(--ease-circ-out) calc(var(--timeline-shape-fill-anim) / 3 + var(--timeline-shape-fill-delay)) backwards 1;
}

.soh-text {
  --dir: 1;
  --angle: 30deg;
  --offset: 300px;
  font-family: "Bebas Neue", "BebasNeue", "BebasNeueBold", "Bebas", Helvetica, sans-serif;
  font-weight: 400;
  fill: var(--color-text);
  will-change: transform;
  -webkit-animation: angleSlideIn var(--timeline-text-anim) var(--ease-more-circ-out) var(--timeline-text-delay) backwards 1;
          animation: angleSlideIn var(--timeline-text-anim) var(--ease-more-circ-out) var(--timeline-text-delay) backwards 1;
}
.soh-text * {
  font-family: inherit;
}

.soh-text--stateof {
  transform-origin: 0% 50%;
  -webkit-animation-delay: calc(var(--timeline-text-delay) - var(--timeline-shape-fill-anim) * 0.25);
          animation-delay: calc(var(--timeline-text-delay) - var(--timeline-shape-fill-anim) * 0.25);
}

.soh-text--year {
  --dir: -1;
  transform-origin: 100% 50%;
}
.soh-text > text { letter-spacing: 0.1625em; }

@-webkit-keyframes angleSlideIn {
  from {
    filter: Opacity(calc(100% * var(--starting-opacity, 0)));
    opacity: var(--starting-opacity, 0);
    transform: translate(calc((1 - tan(var(--angle))) * 2 * var(--dir, 1) * var(--offset)), calc(var(--dir, 1) * var(--offset) * sin(var(--angle))));
  }
}

@keyframes angleSlideIn {
  from {
    filter: Opacity(calc(100% * var(--starting-opacity, 0)));
    opacity: var(--starting-opacity, 0);
    transform: translate(calc((1 - tan(var(--angle))) * 2 * var(--dir, 1) * var(--offset)), calc(var(--dir, 1) * var(--offset) * sin(var(--angle))));
  }
}
@-webkit-keyframes scaleIn {
  from {
    transform: scale(0.0001);
  }
}
@keyframes scaleIn {
  from {
    transform: scale(0.0001);
  }
}
@-webkit-keyframes lineIn {
  from {
    stroke-dashoffset: 1;
  }
}
@keyframes lineIn {
  from {
    stroke-dashoffset: 1;
  }
}
@-webkit-keyframes fadeIn {
  from {
    filter: opacity(0%);
    opacity: 0;
  }
}
@keyframes fadeIn {
  from {
    filter: opacity(0%);
    opacity: 0;
  }
}
@-webkit-keyframes fadeOut {
  to {
    opacity: 0;
  }
}
@keyframes fadeOut {
  to {
    opacity: 0;
  }
}
@-webkit-keyframes untranslateIn {
  from {
    transform: translate(calc(11.28328377 / 1019.426 * 100%), calc(15.8194327 / 302.4304 * 100%));
  }
}
@keyframes untranslateIn {
  from {
    transform: translate(calc(11.28328377 / 1019.426 * 100%), calc(15.8194327 / 302.4304 * 100%));
  }
}
`
export const Logo = ({ className, animated = true, showText = true, size = 'l' }: LogoProps) => (
    <Wrapper className="soc-logo__wrapper">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            aria-label="State of HTML 2023"
            className="soh-logo"
            viewBox="0 0 1819.33 1819.33"
        >
            <defs>
                <style>{style}</style>
                <linearGradient
                    id="soh-grad-slash-1"
                    x1="431.96"
                    x2="774.71"
                    y1="989.95"
                    y2="1187.83"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="var(--color-slash-one-a)"></stop>
                    <stop offset="0.33" stopColor="var(--color-slash-one-b)"></stop>
                    <stop offset="1" stopColor="var(--color-slash-one-c)"></stop>
                </linearGradient>
                <linearGradient
                    id="soh-grad-slash-2"
                    x1="3140.05"
                    x2="3711.29"
                    y1="3222.07"
                    y2="3551.87"
                    gradientTransform="matrix(.6 0 0 .6 -1328.87 -1014.18)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="var(--color-slash-two-a)"></stop>
                    <stop offset="0.33" stopColor="var(--color-slash-two-b)"></stop>
                    <stop offset="0.67" stopColor="var(--color-slash-two-c)"></stop>
                    <stop offset="1" stopColor="var(--color-slash-two-d)"></stop>
                </linearGradient>
                <linearGradient
                    id="soh-grad-slash-3"
                    x1="16680.49"
                    x2="18394.22"
                    y1="14382.64"
                    y2="15372.07"
                    gradientTransform="matrix(.2 0 0 .2 -2657.74 -2028.37)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="var(--color-slash-three-a)"></stop>
                    <stop offset="0.33" stopColor="var(--color-slash-three-b)"></stop>
                    <stop offset="0.67" stopColor="var(--color-slash-three-c)"></stop>
                    <stop offset="1" stopColor="var(--color-slash-three-d)"></stop>
                </linearGradient>
                <linearGradient
                    id="soh-grad-slash-4"
                    x1="-25642.39"
                    x2="-23928.66"
                    y1="-20095.54"
                    y2="-19106.12"
                    gradientTransform="matrix(-.2 0 0 -.2 -3986.62 -3042.55)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="var(--color-slash-three-a)"></stop>
                    <stop offset="0.33" stopColor="var(--color-slash-three-b)"></stop>
                    <stop offset="0.67" stopColor="var(--color-slash-three-c)"></stop>
                    <stop offset="1" stopColor="var(--color-slash-three-d)"></stop>
                </linearGradient>
                <linearGradient
                    id="soh-grad-slash-5"
                    x1="-10967.58"
                    x2="-10396.33"
                    y1="-8270.66"
                    y2="-7940.86"
                    gradientTransform="matrix(-.6 0 0 -.6 -5315.49 -4056.74)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="var(--color-slash-two-a)"></stop>
                    <stop offset="0.33" stopColor="var(--color-slash-two-b)"></stop>
                    <stop offset="0.67" stopColor="var(--color-slash-two-c)"></stop>
                    <stop offset="1" stopColor="var(--color-slash-two-d)"></stop>
                </linearGradient>
                <linearGradient
                    id="soh-grad-slash-6"
                    x1="-8031.95"
                    x2="-7689.2"
                    y1="-5906.07"
                    y2="-5708.18"
                    gradientTransform="rotate(-180 -3322.18 -2535.46)"
                    xlinkHref="#soh-grad-slash-1"
                ></linearGradient>
                <linearGradient
                    id="soh-grad-chevron-back-a"
                    x1="102.8"
                    x2="764.43"
                    y1="736.73"
                    y2="736.73"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="var(--color-chevron-back-a)"></stop>
                    <stop offset="1" stopColor="var(--color-chevron-back-b)"></stop>
                </linearGradient>
                <linearGradient
                    id="soh-grad-chevron-back-b"
                    x1="-12254.28"
                    x2="-11592.65"
                    y1="731.48"
                    y2="731.48"
                    gradientTransform="rotate(-180 -5268.76 909.92)"
                    xlinkHref="#soh-grad-chevron-back-a"
                ></linearGradient>
                <linearGradient
                    id="soh-grad-chevron-front-a"
                    x1="-12254.28"
                    x2="-11549.08"
                    y1="1107.33"
                    y2="1107.33"
                    gradientTransform="rotate(-180 -5268.76 909.92)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="var(--color-chevron-front-a)"></stop>
                    <stop offset="1" stopColor="var(--color-chevron-front-b)"></stop>
                </linearGradient>
                <linearGradient
                    id="soh-grad-chevron-front-b"
                    x1="-3148.73"
                    x2="-2443.05"
                    y1="7650.22"
                    y2="7650.22"
                    gradientTransform="translate(3251.52 -6537.5)"
                    xlinkHref="#soh-grad-chevron-front-a"
                ></linearGradient>
                <symbol id="soh-front-chevron-right">
                    <path
                        id="soh-front-chevron-right-path"
                        d="M1716.76 765.74L1076.4 396.03l-64.84 225.83 705.2 407.14V765.74z"
                    ></path>
                </symbol>
                <symbol id="soh-front-chevron-left">
                    <path
                        id="soh-front-chevron-left-path"
                        d="M102.8 1059.35l640.82 369.99 64.85-225.83L102.8 796.09v263.26z"
                    ></path>
                </symbol>
                <clipPath id="soh-front-chevron-right-clip">
                    <use xlinkHref="#soh-front-chevron-right-path"></use>
                </clipPath>
                <clipPath id="soh-front-chevron-left-clip">
                    <use xlinkHref="#soh-front-chevron-left-path"></use>
                </clipPath>
                <symbol id="soh-back-chevron-left">
                    <path
                        id="soh-back-chevron-left-path"
                        d="M725.56 436.54L102.8 796.09v263.26l532.12-307.22 90.64-315.59z"
                    ></path>
                </symbol>
                <symbol id="soh-back-chevron-right">
                    <path
                        id="soh-back-chevron-right-path"
                        d="M1093.99 1388.56L1716.76 1029V765.74l-532.14 307.23-90.63 315.59z"
                    ></path>
                </symbol>
                <clipPath id="soh-back-chevron-left-clip">
                    <use xlinkHref="#soh-back-chevron-left-path"></use>
                </clipPath>
                <clipPath id="soh-back-chevron-right-clip">
                    <use xlinkHref="#soh-back-chevron-right-path"></use>
                </clipPath>
                <symbol id="soh-shape-html">
                    <path
                        id="soh-shape-html-path"
                        d="M715.04 758.7l-86.72 302.44h-88.41l32.52-113.41-44.62 25.2-25.3 88.21H414.1l86.72-302.43h88.41l-32.52 113.41 44.62-25.2 25.3-88.21h88.41zm489.41 0v.01l-44.62 25.2 7.23-25.2h-88.42l-44.62 25.2 7.23-25.2h-88.41l-86.73 302.43h88.42l50.58-176.42 44.63-25.2-57.82 201.62h88.42l50.58-176.42 44.62-25.2-57.8 201.62h88.4l86.72-302.43h-88.4zm140.66 214.03l61.37-214.02h-88.41l-86.72 302.43h176.82l25.35-88.41h-88.4zm-430.23-125.6l25.35-88.42H727.64l-25.35 88.41h62.09l-61.37 214.02h88.41l61.37-214.02h62.1z"
                        pathLength="1"
                    ></path>
                </symbol>
                <symbol id="soh-shape-html-letter-h">
                    <path
                        d="M715.04 758.71l-86.72 302.43h-88.41l32.52-113.41-44.62 25.2-25.3 88.21H414.1l86.72-302.43h88.41l-32.52 113.41 44.62-25.2 25.3-88.21h88.41z"
                        pathLength="1"
                    ></path>
                </symbol>
                <symbol id="soh-shape-html-letter-t">
                    <path
                        d="M914.88 847.12l25.35-88.41H727.64l-25.35 88.41h62.09l-61.37 214.02h88.41l61.37-214.02h62.09z"
                        pathLength="1"
                    ></path>
                </symbol>
                <symbol id="soh-shape-html-letter-m">
                    <path
                        d="M1204.45 758.71l-44.62 25.2 7.23-25.2h-88.42l-44.62 25.2 7.23-25.2h-88.42l-86.72 302.43h88.42l50.58-176.42 44.63-25.2-57.82 201.62h88.42l50.58-176.42 44.62-25.2-57.81 201.62h88.41l86.72-302.43h-88.41z"
                        pathLength="1"
                    ></path>
                </symbol>
                <symbol id="soh-shape-html-letter-l">
                    <path
                        d="M1406.48 758.71h-88.41l-86.72 302.43h176.82l25.35-88.41h-88.41l61.37-214.02z"
                        pathLength="1"
                    ></path>
                </symbol>
                <clipPath id="soh-shape-html-mask">
                    <use xlinkHref="#soh-shape-html-path"></use>
                </clipPath>
                <linearGradient
                    id="soh-grad-logo"
                    x1="1749.88"
                    x2="2743.54"
                    y1="770.39"
                    y2="1074.18"
                    gradientTransform="matrix(1 0 -.29 1 -1035.08 0)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="var(--color-grad-shape-a)"></stop>
                    <stop offset="1" stopColor="var(--color-grad-shape-b)"></stop>
                </linearGradient>
            </defs>
            <g className="soh-back-chevrons">
                <g clipPath="url(#soh-back-chevron-left-clip)">
                    <use
                        fill="url(#soh-grad-chevron-back-a)"
                        className="soh-back-chevron soh-back-chevron--left"
                        xlinkHref="#soh-back-chevron-left"
                    ></use>
                </g>
                <g clipPath="url(#soh-back-chevron-right-clip)">
                    <use
                        fill="url(#soh-grad-chevron-back-b)"
                        className="soh-back-chevron soh-back-chevron--right"
                        xlinkHref="#soh-back-chevron-right"
                    ></use>
                </g>
            </g>
            <g className="soh-slashes-clipped">
                <g className="soh-slashes">
                    <path
                        fill="url(#soh-grad-slash-1)"
                        d="M750.28 576.24l53.02-184.58-38.87 22.44-389.31 1355.7 29.26 16.9 36.86-21.28L778.1 592.3l-27.82-16.06z"
                        className="soh-slash--a"
                    ></path>
                    <path
                        fill="url(#soh-grad-slash-2)"
                        d="M537.93 1678.95l-10.55 36.75 37.25-21.51L911.94 484.71l-28.11-16.22 42.46-147.84-38.46 22.21-378.87 1319.36 28.97 16.73z"
                        className="soh-slash--b"
                    ></path>
                    <path
                        fill="url(#soh-grad-slash-3)"
                        d="M671.48 1571.2l-21.11 73.49 37.66-21.75 357.44-1244.77-28.4-16.39 32.22-112.14-38.07 21.97-368.43 1283.03 28.69 16.56z"
                        className="soh-slash--c"
                    ></path>
                    <path
                        fill="url(#soh-grad-slash-4)"
                        d="M802.95 1463.59l-32.02 111.49 38.06-21.98 368.59-1283.55-28.69-16.55 20.96-72.97-37.66 21.74L774.56 1447.2l28.39 16.39z"
                        className="soh-slash--d"
                    ></path>
                    <path
                        fill="url(#soh-grad-slash-5)"
                        d="M936.54 1355.7l-42.62 148.37 38.47-22.21 379.02-1319.89-28.97-16.72 10.4-36.23-37.25 21.51-347.16 1208.95 28.11 16.22z"
                        className="soh-slash--e"
                    ></path>
                    <path
                        fill="url(#soh-grad-slash-6)"
                        d="M1069.27 1248.85l-53.02 184.58 38.87-22.44 389.31-1355.7-29.26-16.89-36.85 21.27-336.87 1173.13 27.82 16.05z"
                        className="soh-slash--f"
                    ></path>
                </g>
            </g>
            <g className="soh-shape-group">
                <g clipPath="url(#soh-shape-html-mask)" transform="translate(11.283 15.82)">
                    <use
                        fill="var(--color-shape-shadow-bg)"
                        className="soh-shape--shadow-bg"
                        xlinkHref="#soh-shape-html"
                    ></use>
                    <g
                        fill="transparent"
                        stroke="var(--color-shape-shadow-stroke)"
                        strokeWidth="12"
                    >
                        <use
                            className="soh-shape--shadow-stroke"
                            xlinkHref="#soh-shape-html-letter-h"
                        ></use>
                        <use
                            className="soh-shape--shadow-stroke"
                            xlinkHref="#soh-shape-html-letter-t"
                        ></use>
                        <use
                            className="soh-shape--shadow-stroke"
                            xlinkHref="#soh-shape-html-letter-m"
                        ></use>
                        <use
                            className="soh-shape--shadow-stroke"
                            xlinkHref="#soh-shape-html-letter-l"
                        ></use>
                    </g>
                </g>
                <use
                    fill="url(#soh-grad-logo)"
                    className="soh-shape--fill"
                    xlinkHref="#soh-shape-html"
                ></use>
            </g>
            <g className="soh-front-chevrons">
                <g clipPath="url(#soh-front-chevron-right-clip)">
                    <use
                        fill="url(#soh-grad-chevron-front-a)"
                        className="soh-front-chevron soh-front-chevron--right"
                        xlinkHref="#soh-front-chevron-right"
                    ></use>
                </g>
                <g clipPath="url(#soh-front-chevron-left-clip)">
                    <use
                        fill="url(#soh-grad-chevron-front-b)"
                        className="soh-front-chevron soh-front-chevron--left"
                        xlinkHref="#soh-front-chevron-left"
                    ></use>
                </g>
            </g>
            <g>
    			<g transform="rotate(30)">
    				<g className="soh-text soh-text--stateof">
    					<text x="1070" y="660" font-size="90">
    						<tspan>S</tspan>
    						<tspan>T</tspan>
    						<tspan>A</tspan>
    						<tspan>T</tspan>
    						<tspan>E</tspan>
    						<tspan> </tspan>
    						<tspan>O</tspan>
    						<tspan>F</tspan>
    					</text>
    				</g>
    			</g>
    
    			<g transform="rotate(30)">
    				<g className="soh-text soh-text--year">
    					<text x="728" y="1260" font-size="100" text-anchor="end">
    						<tspan>2</tspan>
    						<tspan>0</tspan>
    						<tspan>2</tspan>
    						<tspan>3</tspan>
    					</text>
    				</g>
    			</g>
    		</g>
        </svg>
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
    --color-bg: #87520d;
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
        filter: drop-shadow(0 10px 30px var(--color-bg));
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
