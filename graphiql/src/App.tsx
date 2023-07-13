import React from 'react'
import { GraphiQL } from 'graphiql'
import type { Fetcher } from '@graphiql/toolkit'
import 'graphiql/graphiql.min.css'
import { explorerPlugin } from '@graphiql/plugin-explorer'
// import dotenv from 'dotenv'

// dotenv.config()

const fetcher: Fetcher = async graphQLParams => {
    const apiUrl = process.env.REACT_APP_API_URL
    if (!apiUrl) {
        throw new Error('Could not find environment variable REACT_APP_API_URL')
    }
    const data = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphQLParams),
        credentials: 'same-origin'
    })
    return data.json().catch(() => data.text())
}

// pass the explorer props here if you want
const explorer = explorerPlugin({ showAttribution: true })

const App = () => <GraphiQL fetcher={fetcher} plugins={[explorer]} />

export default App
