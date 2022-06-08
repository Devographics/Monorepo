import Newsletter from './Newsletter'
import SurveyEdition from './SurveyEdition'
import T from './T'

function Homepage({ survey, locale, locales }) {
    const editions = survey.editions.sort((e1, e2) => e2.year - e1.year)
    const { slug } = survey
    const [currentEdition, ...pastEditions] = editions
    return (
        <>
            <h2 className="text-3xl">
                {survey.name} {locale.label}
            </h2>
            <T k="homepage.heading" />
            <T k={`general.${slug}.description`} />
            <section className="current-edition">
                <h3 className="text-xl">
                    <T k="homepage.latest_survey" />
                </h3>
                <SurveyEdition {...currentEdition} />
            </section>
            <section className="past-editions">
                <h3 className="text-xl">
                    <T k="homepage.past_surveys" />
                </h3>
                {pastEditions.map(edition => (
                    <SurveyEdition key={edition.surveyId} {...edition} />
                ))}
            </section>
            <Newsletter />
        </>
    )
}

export default Homepage
