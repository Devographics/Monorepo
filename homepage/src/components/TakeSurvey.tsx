import React, { useState, useEffect } from 'react'
import qs from 'qs'
import T from '@components/T'

const TakeSurvey = ({ locale, url }) => {
    let suffix = ''
    const [source, setSource] = useState()
    const [email, setEmail] = useState()
    const [referrer, setReferrer] = useState('')

    useEffect(() => {
        const q = qs.parse(window.location.href.split('?')[1])
        setSource(q.source)
        setEmail(q.email)
        if (document.referrer) {
            setReferrer(document.referrer)
        }
    })

    if (source || referrer || email) {
        suffix = '?'
        if (source) {
            suffix += `source=${source}&`
        }
        if (referrer) {
            suffix += `referrer=${referrer}&`
        }
        if (email) {
            suffix += `email=${email}&`
        }
    }

    return (
        <a href={url + suffix} className="button">
            <T locale={locale} k="homepage.take_survey" />
        </a>
    )
}

export default TakeSurvey
