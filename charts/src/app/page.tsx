export default function Home() {
    return (
        <main>
            <div>
                <h2>Open graph image for chart (prerendered mode):</h2>
                <a href="/share/prerendered?surveyId=state_of_css&editionId=css2022&sectionId=css_frameworks&blockId=bulma">
                    Access meta page
                </a>
                <h2>On-the-fly generation (experimental)</h2>
                <a href="/share/fly?surveyId=state_of_css&editionId=css2022&sectionId=css_frameworks&blockId=bulma">
                    Access meta page
                </a>
                <h3>Generated image:</h3>
                <img
                    src="/share/fly/serve?surveyId=state_of_css&editionId=css2022&sectionId=css_frameworks&blockId=bulma"
                    alt="If you see this generation failed"
                />
            </div>
        </main>
    )
}
