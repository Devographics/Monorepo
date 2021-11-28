// import React, { createContext, useContext } from 'react'
// import { StaticQuery, graphql } from 'gatsby'
// import get from 'lodash/get'

// export const ToolsContext = createContext()

// const toolsQuery = graphql`
//     query {
//         surveyApi {
//             survey(survey: state_of_css) {
//                 tools {
//                     id
//                     entity {
//                         name
//                     }
//                 }
//             }
//         }
//     }
// `

// export const ToolsContextProvider = ({ children }) => {
//     return (
//         <StaticQuery query={toolsQuery}>
//             {(data) => {
//                 const tools = get(data, 'surveyApi.survey.tools')
//                 const getToolName = ({ id }) => {
//                     const tool = tools.find((t) => t.id === id)
//                     return get(tool, 'entity.name')
//                 }
//                 return (
//                     <ToolsContext.Provider value={{ getToolName }}>
//                         {children}
//                     </ToolsContext.Provider>
//                 )
//             }}
//         </StaticQuery>
//     )
// }

// export const useTools = () => useContext(ToolsContext)
