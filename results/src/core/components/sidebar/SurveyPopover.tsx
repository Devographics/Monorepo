import Popover from 'core/components/Popover2'
import { usePageContext } from 'core/helpers/pageContext'
import './SurveyPopover.scss'
import {
    StateOfCSSIcon,
    StateOfJSIcon,
    StateOfHTMLIcon,
    StateOfDevsIcon,
    StateOfAIIcon,
    StateOfReactIcon
} from '@devographics/icons'
import SidebarLogo from 'Logo/SidebarLogo'
import { screenReadersOnlyMixin } from 'core/theme'

import React, { useState } from 'react'
import { SurveyMetadata, EditionMetadata } from '@devographics/types'
import PopoverIndicator from '../PopoverIndicator'
import { useI18n } from '@devographics/react-i18n'

import styled from 'styled-components'
import Button from '../Button'
import T from 'core/i18n/T'
import { getEditionImageUrl } from '@devographics/helpers'
import Tooltip from '../Tooltip'

const icons = {
    state_of_js: StateOfJSIcon,
    state_of_css: StateOfCSSIcon,
    state_of_html: StateOfHTMLIcon,
    state_of_ai: StateOfAIIcon,
    state_of_devs: StateOfDevsIcon,
    state_of_react: StateOfReactIcon
}

export const SurveyPopover = () => {
    const [isOpened, setIsOpened] = useState(false)

    const { translate } = useI18n()
    return (
        <Popover
            onOpenChange={setIsOpened}
            trigger={
                <Button className="survey-popover-trigger">
                    <SidebarLogo />
                    <PopoverIndicator isOpened={isOpened} />
                    <ScreenReadersHint>{translate('general.back_to_intro')}</ScreenReadersHint>
                </Button>
            }
        >
            <Contents />
        </Popover>
    )
}

const ScreenReadersHint = styled.span`
    ${screenReadersOnlyMixin}
`

const Contents = () => {
    const pageContext = usePageContext()
    const { allSurveys, currentSurvey, currentEdition } = pageContext
    const { editions } = currentSurvey
    const filteredEditions = editions
        .filter(e => e.id !== currentEdition.id)
        .filter(e => e.resultsUrl)
        .sort((a, b) => b.year - a.year)
    const otherSurveys = allSurveys
        .filter(s => !s.isDisabled)
        .filter(s => s.id !== currentSurvey.id)
    return (
        <div className="survey-popover">
            <section>
                <h3>
                    <T k="general.other_editions" />
                </h3>
                <div className="survey-popover-items">
                    {filteredEditions.slice(0, 3).map(edition => (
                        <Edition survey={currentSurvey} edition={edition} key={edition.id} />
                    ))}
                </div>
                {filteredEditions.length > 3 && (
                    <div>
                        <a
                            href={currentSurvey.homepageUrl}
                            target="_blank"
                            rel="noreferrer nofollow"
                        >
                            <T k="general.all_editions" />
                        </a>
                    </div>
                )}
            </section>
            {/* <div>
                All Editions:{' '}
                <a href={currentSurvey.homepageUrl} target="_blank" rel="nofollow noreferrer">
                    {currentSurvey.name}
                </a>
            </div> */}
            {/* <hr /> */}
            {otherSurveys.length > 0 && (
                <section>
                    <h3>
                        <T k="general.other_surveys" />
                    </h3>
                    <div className="survey-popover-items">
                        {otherSurveys.map(survey => (
                            <Survey survey={survey} key={survey.id} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

const Edition = ({ survey, edition }: { survey: SurveyMetadata; edition: EditionMetadata }) => {
    const { id, resultsUrl, year } = edition
    const Icon = icons[survey.id]
    const assetUrl = process.env.GATSBY_ASSETS_URL || ''
    const imageUrl = getEditionImageUrl({ edition, assetUrl })
    return (
        <div className="survey-popover-item survey-popover-edition">
            <Tooltip
                trigger={
                    <Button
                        as={'a'}
                        href={resultsUrl}
                        className="survey-popover-item-wrapper"
                        target="_blank"
                        rel="noreferrer nofollow"
                    >
                        {/* <Icon /> */}
                        <img src={imageUrl?.replace('.png', '@05x.png')} />
                    </Button>
                }
                contents={
                    <span>
                        {survey.name} {year}
                    </span>
                }
            />

            <h4 className="survey-popover-item-year">
                <a href={resultsUrl} target="_blank" rel="noreferrer nofollow">
                    {year}
                </a>
            </h4>
        </div>
    )
}

const Survey = ({ survey }: { survey: SurveyMetadata }) => {
    const { id, homepageUrl, name, imageUrl } = survey
    const Icon = icons[id]
    return (
        <div className="survey-popover-item survey-popover-survey">
            <Tooltip
                trigger={
                    <Button
                        as={'a'}
                        href={homepageUrl}
                        className="survey-popover-item-wrapper"
                        target="_blank"
                        rel="noreferrer nofollow"
                    >
                        <Icon />
                    </Button>
                }
                contents={<span>{name}</span>}
            />

            {/* <h4>
                <a href={homepageUrl} target="_blank" rel="noreferrer nofollow">
                    {name}
                </a>
            </h4> */}
        </div>
    )
}
export default SurveyPopover
