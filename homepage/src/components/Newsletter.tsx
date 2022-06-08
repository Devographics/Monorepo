import React, { useState } from 'react'
import { useI18n } from '../helpers/i18nContext'

const getEOConfig = listId => ({
    emailOctopusUrl: `https://emailoctopus.com/lists/${listId}/members/embedded/1.3/add`,
    emailOctopusSiteKey: '6LdYsmsUAAAAAPXVTt-ovRsPIJ_IVhvYBBhGvRV6',
    emailOctopusCode: 'hpc4b27b6e-eb38-11e9-be00-06b4694bee2a'
})

export default function Newsletter({ listId }) {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const eoConfig = getEOConfig(listId)

    const handleChange = e => {
        const email = e.target.value
        setEmail(email)
    }

    const handleSubmit = async e => {
        setLoading(true)

        console.log('SUBMITTING')

        e.preventDefault()
        const response = await fetch(eoConfig.emailOctopusUrl, {
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
                    {...eoConfig}
                />
            )}
        </>
    )
}

const NewsletterForm = ({
    email,
    loading,
    handleSubmit,
    handleChange,
    emailOctopusUrl,
    emailOctopusSiteKey,
    emailOctopusCode
}) => {
    const { getString } = useI18n()
    return (
        <div className="newsletter">
            <form
                method="post"
                action={emailOctopusUrl}
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
                <button
                    type="submit"
                    name="subscribe"
                    className="border-dotted border-1 border-black "
                >
                    {getString('blocks.newsletter.submit')?.t}
                </button>
            </form>
        </div>
    )
}
