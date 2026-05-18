import React from 'react'
import './SurveyStatsBlock.scss'

import { BlockVariantDefinition } from '@devographics/types'
import { usePageContext } from 'core/helpers/pageContext'
import T from 'core/i18n/T'
import { formatNumber } from 'core/charts/common2/helpers/format'
import Link from 'core/components/LocaleLink'

const SurveyStatsBlock = (props: { block: BlockVariantDefinition }) => {
    console.log(props)
    const { currentEdition, currentEditionStats } = usePageContext()
    const { startedAt, endedAt, questionsUrl } = currentEdition
    return (
        <div className="survey-stats">
            <div>
                <h4>
                    <T k="general.start_date" />
                </h4>
                <p>{startedAt}</p>
            </div>
            <div>
                <h4>
                    <T k="general.end_date" />
                </h4>
                <p>{endedAt}</p>
            </div>
            <div>
                <h4>
                    <T k="general.number_of_respondents" />
                </h4>
                <p>{formatNumber(currentEditionStats.totalRespondents)}</p>
            </div>
            <div>
                <h4>
                    <T k="general.survey_archive" />
                </h4>
                <p>
                    <a href={questionsUrl} target="_blank" rel="noreferrer">
                        <T k="general.review_questions" /> →
                    </a>
                </p>
            </div>
            <div>
                <h4>
                    <T k="general.get_data" />
                </h4>
                <p>
                    <Link to="/download">
                        <T k="general.download_data" /> →
                    </Link>
                </p>
            </div>
        </div>
    )
}
export default SurveyStatsBlock
