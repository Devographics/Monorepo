export default function Home() {
    return (
        <main>
            <p>
                <h2>Open graph image for chart (prerendered mode):</h2>
                <a href="/og/prerendered?survey=state_of_css&edition=css2022&section=css_frameworks&question=css_frameworks_happiness">
                    Access meta page
                </a>
                <h2>On-the-fly generation (experimental)</h2>
                <a href="/og/fly?survey=state_of_css&edition=css2022&section=css_frameworks&question=css_frameworks_happiness">
                    Access meta page
                </a>
                <h3>Generated image:</h3>
                <img
                    src="/og/fly/serve?survey=state_of_css&edition=css2022&section=css_frameworks&question=css_frameworks_happiness"
                    alt="If you see this generation failed"
                />
            </p>
        </main>
    )
}
