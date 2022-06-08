import React from 'react'
import T from './T'

export default function SurveyEdition({ name, year, questionsUrl, resultsUrl, imageUrl }) {
    return (
        <div>
            <h4>{year}</h4>
            <img src={imageUrl} width={300} />
            <h3>{name}</h3>
            <div>
                <a href={questionsUrl}>
                    <T k="homepage.review_questions" />
                </a>
            </div>
            <div>
                <a href={resultsUrl}>
                    <T k="homepage.view_results" />
                </a>
            </div>
        </div>
    )
}
