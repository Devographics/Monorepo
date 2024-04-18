import React, { useEffect, useState, createContext, useContext } from 'react'

const keydownContext = createContext<{ modKeyDown?: boolean }>({})

const targetKey = 'Alt'

const KeydownContextProviderInner = ({ children }: { children: React.ReactNode }) => {
    const [modKeyDown, setModKeyDown] = useState(false)
    const value = {
        modKeyDown
    }

    function downHandler({ key }: { key: string }) {
        if (key === targetKey) {
            setModKeyDown(true)
        }
    }

    const upHandler = ({ key }: { key: string }) => {
        if (key === targetKey) {
            setModKeyDown(false)
        }
    }
    useEffect(() => {
        window.addEventListener('keydown', downHandler)
        window.addEventListener('keyup', upHandler)
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener('keydown', downHandler)
            window.removeEventListener('keyup', upHandler)
        }
    }, []) // Empty array ensures that effect is only run on mount and unmount

    return (
        <keydownContext.Provider value={value}>
            <div className={modKeyDown ? 'modKeyDown' : 'modKeyUp'}>{children}</div>
        </keydownContext.Provider>
    )
}

export const KeydownContextProvider = ({ children }: { children: React.ReactNode }) => {
    return <KeydownContextProviderInner>{children}</KeydownContextProviderInner>
}

export const useKeydownContext = () => useContext(keydownContext)
