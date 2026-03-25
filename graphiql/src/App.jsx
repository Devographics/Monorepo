import { GraphiQL, HISTORY_PLUGIN } from 'graphiql'
import 'graphiql/style.css'
import { explorerPlugin } from '@graphiql/plugin-explorer'

async function fetcher(graphQLParams) {
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphQLParams)
    })
    return response.json()
}

const plugins = [HISTORY_PLUGIN, explorerPlugin({ showAttribution: true })]

function App() {
    return <GraphiQL fetcher={fetcher} plugins={plugins} />
}

export default App
