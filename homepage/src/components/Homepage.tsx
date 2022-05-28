import SurveyEdition from './SurveyEdition'

function Homepage({ survey, locale }) {
    return (
        <>
            <h2>
                {survey.name} {locale.label}
            </h2>
            {survey.editions.reverse().map(edition => (
                <SurveyEdition key={edition.surveyId} {...edition} />
            ))}
        </>
    )
}

export default Homepage
