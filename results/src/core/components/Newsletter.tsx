import React, { useState } from 'react'
import { useI18n } from '@devographics/react-i18n'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import Button from './Button'
import styled from 'styled-components'
import { spacing } from 'core/theme'

export default function Newsletter({ locale }: { locale?: any }) {
    const { currentSurvey } = usePageContext()
    const submitUrl = currentSurvey?.emailOctopus?.submitUrl

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<{ message: string } | null>(null)
    const [success, setSuccess] = useState<{ message: string } | null>(null)

    // const config = getEOConfig(listId)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value
        setEmail(email)
    }

    const handleSubmit = async (e: SubmitEvent) => {
        setLoading(true)

        console.log('SUBMITTING')

        e.preventDefault()
        const response = await fetch(submitUrl, {
            method: 'POST',
            body: `field_0=${encodeURIComponent(email)}&hpc4b27b6e-eb38-11e9-be00-06b4694bee2a=`,
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
        <div className="newsletter">
            <h3 className="newsletter-heading">
                <T k="newsletter.stay_tuned" />
            </h3>
            <p className="newsletter-details">
                <T k="newsletter.leave_your_email" />
            </p>{' '}
            {error && <div className="newsletter-message newsletter-error">{error.message}</div>}
            {success ? (
                <div className="newsletter-message newsletter-success">{success.message}</div>
            ) : (
                <NewsletterForm
                    email={email}
                    loading={loading}
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                    submitUrl={submitUrl}
                />
            )}
        </div>
    )
}

const NewsletterForm = ({
    email,
    loading,
    handleSubmit,
    handleChange,
    submitUrl
}: //locale
{
    email: string
    loading?: boolean
    handleSubmit?: any
    handleChange?: any
    submitUrl: string
}) => {
    const { getString } = useI18n()

    return (
        <div className="newsletter-form">
            <Form_ method="post" action={submitUrl} onSubmit={handleSubmit}>
                <Input_
                    className="newsletter-email"
                    id="field_0"
                    name="field_0"
                    type="email"
                    placeholder={getString('newsletter.email')?.t}
                    onChange={handleChange}
                    value={email}
                    disabled={loading}
                />
                <Button type="submit" name="subscribe" className="newsletter-button button">
                    <T k="newsletter.submit" />
                </Button>
            </Form_>
        </div>
    )
}

const Input_ = styled.input`
    padding: 10px 20px;
`

const Form_ = styled.form`
    align-items: center;
    display: flex;
    gap: ${spacing(0.5)};
`
