import React, { useState } from 'react'
import { useI18n } from '../helpers/i18nContext'

const emailOctopusUrl = import.meta.env.EO_URL
const emailOctopusCode = import.meta.env.EO_CODE
const emailOctopusSiteKey = import.meta.env.EO_SITEKEY

const postUrl = emailOctopusUrl

export default function Newsletter() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const handleChange = e => {
        const email = e.target.value
        setEmail(email)
    }

    const handleSubmit = async e => {
        setLoading(true)

        console.log('SUBMITTING')

        e.preventDefault()
        const response = await fetch(postUrl, {
            method: 'POST',
            body: `field_0=${encodeURIComponent(email)}`,
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        })
        const result = await response.json()
        const { error, message } = result

        setLoading(false)

        if (error) {
            setError(error)
            setSuccess(null)
        } else {
            setError(null)
            setSuccess({ message })
        }
    }

    return (
        <>
            {error && <div className="Newsletter__Error">{error.message}</div>}
            {success ? (
                <div>{success.message}</div>
            ) : (
                <NewsletterForm
                    email={email}
                    loading={loading}
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                />
            )}
        </>
    )
}

const NewsletterForm = ({ email, loading, handleSubmit, handleChange }) => {
    const { getString } = useI18n()
    return (
        <form
            method="post"
            action={postUrl}
            datasitekey={emailOctopusSiteKey}
            onSubmit={handleSubmit}
        >
            <input
                id="field_0"
                name="field_0"
                type="email"
                placeholder={getString('blocks.newsletter.email')?.t}
                onChange={handleChange}
                value={email}
                disabled={loading}
            />
            <input
                type="text"
                name={emailOctopusCode}
                tabIndex={-1}
                autoComplete="nope"
                style={{ display: 'none' }}
            />
            <button type="submit" name="subscribe" className="border-dotted border-1 border-black ">
                {getString('blocks.newsletter.submit')?.t}
            </button>
        </form>
    )
}
