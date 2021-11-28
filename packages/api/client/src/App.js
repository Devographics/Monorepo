import React, { Component } from 'react'
import GraphiQL from 'graphiql'
import GraphiQLExplorer from 'graphiql-explorer'
import { buildClientSchema, getIntrospectionQuery, parse } from 'graphql'
import dotenv from 'dotenv'
import 'graphiql/graphiql.css'
import './App.css'

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
dotenv.config({ path: envFile })

function fetcher(params) {
    return fetch(process.env.REACT_APP_ENDPOINT_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
        .then(function(response) {
            return response.text()
        })
        .then(function(responseBody) {
            try {
                return JSON.parse(responseBody)
            } catch (e) {
                return responseBody
            }
        })
}

const DEFAULT_QUERY = `# Get started by opening the explorer and running your queries
query ReactHistoricalResults {
  survey(survey: js) {
    tool(id: react) {
      experience {
        allYears {
          awarenessInterestSatisfaction {
            awareness
            interest
            satisfaction
          }
        }
      }
    }
  }
}
`

let defaultQuery = null
try {
    defaultQuery = localStorage.getItem('graphiql:query') || DEFAULT_QUERY
} catch (e) {
    console.warn('Error getting initial defaultQuery: ', e)
    defaultQuery = DEFAULT_QUERY
}

let defaultExplorerIsOpen = null
try {
    defaultExplorerIsOpen = JSON.parse(localStorage.getItem('graphiql:explorerIsOpen') || 'true')
} catch (e) {
    console.warn('Error getting initial defaultExplorerIsOpen: ', e)
    defaultExplorerIsOpen = true
}

class App extends Component {
    _graphiql: GraphiQL
    state = { schema: null, query: defaultQuery, explorerIsOpen: defaultExplorerIsOpen }

    componentDidMount() {
        fetcher({
            query: getIntrospectionQuery()
        }).then(result => {
            const editor = this._graphiql.getQueryEditor()
            editor.setOption('extraKeys', {
                ...(editor.options.extraKeys || {}),
                'Shift-Alt-LeftClick': this._handleInspectOperation
            })

            this.setState({ schema: buildClientSchema(result.data) })
        })
    }

    _handleInspectOperation = (cm, mousePos) => {
        const parsedQuery = parse(this.state.query || '')

        if (!parsedQuery) {
            console.error("Couldn't parse query document")
            return null
        }

        var token = cm.getTokenAt(mousePos)
        var start = { line: mousePos.line, ch: token.start }
        var end = { line: mousePos.line, ch: token.end }
        var relevantMousePos = {
            start: cm.indexFromPos(start),
            end: cm.indexFromPos(end)
        }

        var position = relevantMousePos

        var def = parsedQuery.definitions.find(definition => {
            if (!definition.loc) {
                console.log('Missing location information for definition')
                return false
            }

            const { start, end } = definition.loc
            return start <= position.start && end >= position.end
        })

        if (!def) {
            console.error('Unable to find definition corresponding to mouse position')
            return null
        }

        var operationKind =
            def.kind === 'OperationDefinition'
                ? def.operation
                : def.kind === 'FragmentDefinition'
                ? 'fragment'
                : 'unknown'

        var operationName =
            def.kind === 'OperationDefinition' && !!def.name
                ? def.name.value
                : def.kind === 'FragmentDefinition' && !!def.name
                ? def.name.value
                : 'unknown'

        var selector = `.graphiql-explorer-root #${operationKind}-${operationName}`

        var el = document.querySelector(selector)
        el && el.scrollIntoView()
    }

    _handleEditQuery = query => {
        localStorage.setItem('graphiql:query', query)
        this.setState({ query })
    }

    _handleToggleExplorer = () => {
        const explorerIsOpen = !this.state.explorerIsOpen
        localStorage.setItem('graphiql:explorerIsOpen', JSON.stringify(explorerIsOpen))

        this.setState({ explorerIsOpen: explorerIsOpen })
    }

    render() {
        const { schema, query } = this.state
        return (
            <div className="graphiql-container">
                <GraphiQLExplorer
                    schema={schema}
                    query={query}
                    onEdit={this._handleEditQuery}
                    onRunOperation={operationName => this._graphiql.handleRunQuery(operationName)}
                    explorerIsOpen={this.state.explorerIsOpen}
                    onToggleExplorer={this._handleToggleExplorer}
                    showAttribution={false}
                />
                <GraphiQL
                    ref={ref => (this._graphiql = ref)}
                    fetcher={fetcher}
                    schema={schema}
                    query={query}
                    onEditQuery={this._handleEditQuery}
                >
                    <GraphiQL.Logo>State of JS</GraphiQL.Logo>
                    <GraphiQL.Toolbar>
                        <GraphiQL.Button
                            onClick={() => this._graphiql.handlePrettifyQuery()}
                            label="Prettify"
                            title="Prettify Query (Shift-Ctrl-P)"
                        />
                        <GraphiQL.Button
                            onClick={() => this._graphiql.handleToggleHistory()}
                            label="History"
                            title="Show History"
                        />
                        <GraphiQL.Button
                            onClick={this._handleToggleExplorer}
                            label="Explorer"
                            title="Toggle Explorer"
                        />
                        <GraphiQL.Button
                            onClick={() => {
                                if (typeof window === 'undefined') {
                                    console.warn('Clicked in browserless environment')
                                    return
                                }

                                window.open('https://api.stateofjs.com/')
                            }}
                            label="Help"
                            title="Open API help"
                        />
                    </GraphiQL.Toolbar>
                </GraphiQL>
            </div>
        )
    }
}

export default App
