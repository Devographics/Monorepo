// This code is specific to the result app
// no need to move it to shared i18n code
import React, { useState } from 'react'
import styled from 'styled-components'
import { usePageContext } from 'core/helpers/pageContext'
import { T } from './T'
import { Locales } from './Locales'
import Popover from 'core/components/Popover2'
import './LanguageSwitcher.scss'
import Button from 'core/components/Button'
import PopoverIndicator from 'core/components/PopoverIndicator'

const translationLink = 'https://github.com/Devographics/locale-en-US'

const LanguageSwitcher = (/*{ position = 'bottom', positionOpen = 'top' }*/) => {
    const context = usePageContext()
    const locales = context?.locales || []

    const [isOpened, setIsOpened] = useState(false)
    return locales.length > 1 ? (
        <Popover
            onOpenChange={setIsOpened}
            trigger={
                <Button className="language-switcher-trigger">
                    <span>{context?.locale?.label}</span>
                    <PopoverIndicator isOpened={isOpened} />
                </Button>
            }
        >
            <LanguageSwitcherContents />
        </Popover>
    ) : null
}

export const LanguageSwitcherContents = () => {
    return (
        <>
            <Locales />
            <LanguageSwitcherHelp className="LanguageSwitcherHelp">
                <a href={translationLink}>
                    <T k="general.help_us_translate" />
                </a>
            </LanguageSwitcherHelp>
        </>
    )
}

// const LanguageSwitcher = ({ position = 'bottom', positionOpen = 'top' }) => {
//     const { translate } = useI18n()
//     const wrapperRef = useRef(null)

//     const context = usePageContext()
//     const [isOpened, setIsOpened] = useState(false)
//     const toggle = useCallback(() => {
//         setIsOpened((flag) => !flag)
//     }, [setIsOpened])

//     const handleClickOutside = useCallback(
//         (event) => {
//             if (isOpened && wrapperRef.current && !wrapperRef.current.contains(event.target)) {
//                 setIsOpened(false)
//             }
//         },
//         [isOpened]
//     )

//     useEffect(() => {
//         document.addEventListener('click', handleClickOutside, false)
//         return () => {
//             document.removeEventListener('click', handleClickOutside, false)
//         }
//     }, [handleClickOutside])

//     return (
//         <Container
//             className={`LanguageSwitcher LanguageSwitcher--${position} ${
//                 isOpened ? '_is-opened' : '_is-closed'
//             }`}
//         >
//             <LanguageSwitcherInner className="LanguageSwitcherInner">
//                 <LanguageSwitcherToggle className="LanguageSwitcherToggle" onClick={toggle}>
//                     <span>{get(context, 'locale.label')}</span>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
//                         {isOpened ? svgs[positionOpen] : svgs[position]}
//                     </svg>
//                 </LanguageSwitcherToggle>
//                 <LanguageSwitcherPopup
//                     ref={wrapperRef}
//                     className="LanguageSwitcherPopup"
//                     position={position}
//                 >
//                     <Locales />
//                     <LanguageSwitcherHelp className="LanguageSwitcherHelp">
//                         <a href={config.translationLink}>
//                             {translate('general.help_us_translate')}
//                         </a>
//                     </LanguageSwitcherHelp>
//                 </LanguageSwitcherPopup>
//             </LanguageSwitcherInner>
//         </Container>
//     )
// }

// const Container = styled.div`
//     .Pagination & {
//         @media ${mq.smallMedium} {
//             display: none;
//         }
//     }

//     .Sidebar & {
//         margin-bottom: var(--spacing);
//         border: var(--separationBorder);

//         @media ${mq.large} {
//             display: none;
//         }
//     }
// `

// const LanguageSwitcherInner = styled.div`
//     position: relative;

//     .Sidebar & {
//         padding: 8px 12px;
//     }
// `

// const LanguageSwitcherToggle = styled.div`
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     font-size: var(--fontSizeMedium);
//     cursor: pointer;

//     span {
//         display: block;
//         margin-right: var(--quarterSpacing);
//     }

//     svg {
//         display: block;
//         width: 12px;
//         position: relative;
//         polygon {
//             fill: ${({ theme }) => theme.colors.text};
//         }
//     }

//     .Pagination & {
//         padding: var(--spacing);
//     }

//     @media ${mq.smallMedium} {
//         font-size: var(--fontSizeSmall);
//     }
// `

// const ARROW_SIZE = 18

// const LanguageSwitcherPopup = styled.div`
//     position: absolute;
//     top: 125%;
//     width: 300px;
//     left: 50%;
//     padding: var(--spacing);
//     background: ${(props) => props.theme.colors.background};
//     border: ${(props) => props.theme.separationBorder};
//     transform: translateX(-50%);
//     z-index: 10000;
//     box-shadow: var(--blockShadow);

//     &:before {
//         left: 50%;
//         border: solid transparent;
//         content: ' ';
//         height: ${ARROW_SIZE}px;
//         width: ${ARROW_SIZE}px;
//         background: ${(props) => props.theme.colors.background};
//         position: absolute;
//         pointer-events: none;
//         transform-origin: center center;
//         border: ${(props) => props.theme.separationBorder};
//         top: 0;
//         transform: translate(${ARROW_SIZE * -0.5}px, ${ARROW_SIZE * -0.5}px) rotate(-45deg);
//         border-bottom: 0;
//         border-left: 0;
//     }

//     @media ${mq.smallMedium} {
//         top: 145%;
//     }

//     @media ${mq.xSmall} {
//         max-width: 90vw;
//     }

//     .LanguageSwitcher._is-closed & {
//         display: none;
//         // @include sr-only;
//     }
// }
// `

const LanguageSwitcherHelp = styled.div`
    font-size: var(--fontSizeSmall);
    padding-top: var(--spacing);
    margin-top: var(--spacing);
    border-top: var(--separationBorder);
`

export default LanguageSwitcher
