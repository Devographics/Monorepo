import React, { useState } from 'react'
import { useI18n } from 'core/i18n/i18nContext'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import Button from './Button'
import styled from 'styled-components'
import { spacing } from 'core/theme'
import jsonp from 'jsonp'

export default function NewsletterMC({ locale }: { locale?: any }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<{ message: string } | null>(null)
    const [success, setSuccess] = useState<{ message: string } | null>(null)

    const postUrl = process.env.GATSBY_MAILCHIMP_URL || ''

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value
        setEmail(email)
    }

    const handleSubmit = async (e: SubmitEvent) => {
        setLoading(true)

        console.log('SUBMITTING')

        e.preventDefault()
        // const response = await fetch(`${postUrl}&EMAIL=${encodeURIComponent(email)}`, {
        //     method: 'GET',
        //     mode: 'no-cors',
        //     headers: {
        //         Accept: '*/*'
        //     }
        // })
        jsonp(`${postUrl}&EMAIL=${email}`, { param: 'c' }, (_, data = {}) => {
            const { msg, result, error } = data

            setLoading(false)

            console.log(_)
            console.log(data)
            if (error) {
                setError(error)
                setSuccess(null)
            } else {
                setError(null)
                setSuccess({ message: msg })
            }
        })

        // const result = await response.json()
        // const { error, message } = result

        // setLoading(false)

        // if (error) {
        //     setError(error)
        //     setSuccess(null)
        // } else {
        //     setError(null)
        //     setSuccess({ message })
        // }
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
                />
            )}
        </div>
    )
}

const NewsletterForm = ({
    email,
    loading,
    handleSubmit,
    handleChange
}: //locale
{
    email: string
    loading?: boolean
    handleSubmit?: any
    handleChange?: any
}) => {
    const { getString } = useI18n()

    return (
        <div className="newsletter-form">
            <Form_ method="get" action={process.env.GATSBY_MAILCHIMP_URL} onSubmit={handleSubmit}>
                <Input_
                    className="newsletter-email"
                    id="EMAIL"
                    name="EMAIL"
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
