import React, { useEffect, useState } from 'react'
import { useI18n } from '@devographics/react-i18n'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import Button from './Button'
import styled from 'styled-components'
import { fontWeight, spacing } from 'core/theme'
import jsonp from 'jsonp'

export default function NewsletterPOST({ locale }: { locale?: any }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<{ message: string } | null>(null)
    const [success, setSuccess] = useState<{ message: string } | null>(null)

    const postUrl = process.env.GATSBY_EMAIL_POST_URL || ''

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value
        setEmail(email)
    }

    const handleSubmit = async (e: SubmitEvent) => {
        setLoading(true)

        console.log('SUBMITTING')

        e.preventDefault()
        const result = await fetch(postUrl, {
            method: 'POST',
            body: JSON.stringify({ 'email_address[email]': email })
        })
        console.log(result)
    }

    useEffect(() => {
        // Select the container
        const container = document.getElementById('mailing-list-container')
        if (container) {
            // Create the script element
            const script = document.createElement('script')
            script.src = 'https://www.tokyodev.com/mailing_list_widget.js'
            script.async = true

            // Append the script to the container
            container.appendChild(script)

            // Cleanup function to remove the script when the component unmounts
            return () => {
                container.removeChild(script)
            }
        }
    }, [])

    const useScript = process.env.GATSBY_EMAIL_USE_TOKYODEV_SCRIPT === 'true'
    return (
        <div className="newsletter">
            <h3 className="newsletter-heading">
                <T k="newsletter.stay_tuned" />
            </h3>
            <p className="newsletter-details">
                <T k="newsletter.leave_your_email" />
            </p>{' '}
            {useScript ? (
                <div id="mailing-list-container"></div>
            ) : (
                <>
                    {success ? (
                        <div className="newsletter-message newsletter-success">
                            {success.message}
                        </div>
                    ) : (
                        <NewsletterForm
                            email={email}
                            loading={loading}
                            handleSubmit={handleSubmit}
                            handleChange={handleChange}
                        />
                    )}
                    {error && (
                        <Error_ className="newsletter-message newsletter-error">
                            {error.message}
                        </Error_>
                    )}
                </>
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
            <Form_ method="post" action={process.env.GATSBY_EMAIL_POST_URL}>
                <Input_
                    className="newsletter-email"
                    id="email_address_email"
                    name="email_address[email]"
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

const Error_ = styled.div`
    color: #fe6a6a;
    margin-top: ${spacing()};
    font-weight: ${fontWeight('bold')};
`
