import T from 'core/i18n/T'
import './Help.scss'
import React, { useState, useEffect } from 'react'
import { LightbulbIcon, LightbulbIconOn } from '@devographics/icons'

const getStorageKey = (id: string) => `help-dismissed-${id}`

export const Help = ({ id, values }: { id: string; values?: any }) => {
    // start hidden so users who already dismissed it don't see a flash on load
    // (also avoids SSR mismatches since localStorage is only available client-side)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        try {
            setIsVisible(!localStorage.getItem(getStorageKey(id)))
        } catch (error) {
            // localStorage can be unavailable (private mode, blocked storage…)
            setIsVisible(true)
        }
    }, [id])

    const handleDismiss = () => {
        setIsVisible(false)
        try {
            localStorage.setItem(getStorageKey(id), 'true')
        } catch (error) {}
    }

    if (!isVisible) {
        return null
    }

    return (
        <div className={`helpnote helpnote-${id}`}>
            <div className="helpnote-image">
                <LightbulbIconOn />
            </div>
            <div className="helpnote-contents">
                <div className="helpnote-heading">
                    <h3>
                        <T k="help.title" /> <T k={`help.${id}`} />
                    </h3>

                    <button
                        className="helpnote-dismiss"
                        onClick={handleDismiss}
                        aria-label="Dismiss"
                    >
                        ×
                    </button>
                </div>
                <div className="helpnote-description">
                    <T k={`help.${id}.description`} values={values} md={true} html={true} />
                </div>
            </div>
        </div>
    )
}

export default Help
