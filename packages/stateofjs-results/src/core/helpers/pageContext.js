import React, { createContext, useContext } from 'react'

const pageContext = createContext({})

export const PageContextProvider = (props) => {
    return <pageContext.Provider value={props.value}>{props.children}</pageContext.Provider>
}

export const usePageContext = () => useContext(pageContext)
