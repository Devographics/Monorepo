import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactGA from 'react-ga'
import styled from 'styled-components'
import config from 'Config/config.yml'
import { mq, spacing } from 'core/theme'
import Button from 'core/components/Button'
import { useI18n } from 'core/i18n/i18nContext'

const { emailOctopusUrl, emailOctopusCode, emailOctopusSiteKey } = config
const postUrl = emailOctopusUrl

export default class Newsletter extends Component {
    static propTypes = {
        line: PropTypes.string
    }

    state = {
        email: '',
        submitted: false,
        loading: false,
        error: null,
        success: null
    }

    handleChange = e => {
        const email = e.target.value
        this.setState({
            email
        })
    }

    handleSubmit = async e => {
        const { email } = this.state

        this.setState({ loading: true })

        console.log('SUBMITTING')

        e.preventDefault()
        ReactGA.event({
            category: 'Subscribe',
            action: `Newsletter subscribe`
        })
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

        this.setState({ loading: false })

        if (error) {
            this.setState({ error, success: null })
        } else {
            this.setState({ error: null, success: { message } })
        }
    }

    render() {
        const { email, loading, error, success } = this.state

        return (
            <>
                {error && (
                    <ErrorFeedback className="Newsletter__Error">{error.message}</ErrorFeedback>
                )}
                {success ? (
                    <SuccessFeedback>{success.message}</SuccessFeedback>
                ) : (
                    <NewsletterForm
                        email={email}
                        loading={loading}
                        handleSubmit={this.handleSubmit}
                        handleChange={this.handleChange}
                    />
                )}
            </>
        )
    }
}

const NewsletterForm = ({ email, loading, handleSubmit, handleChange }) => {
    const { translate } = useI18n()
    return (
        <Form
            method="post"
            action={postUrl}
            datasitekey={emailOctopusSiteKey}
            onSubmit={handleSubmit}
        >
            <Email
                id="field_0"
                name="field_0"
                type="email"
                placeholder={translate('blocks.newsletter.email')}
                onChange={handleChange}
                value={email}
                disabled={loading}
                isLoading={loading}
            />
            <input
                type="text"
                name={emailOctopusCode}
                tabIndex="-1"
                autoComplete="nope"
                style={{ display: 'none' }}
            />
            <SubmitButton as="button" type="submit" name="subscribe">
                {translate('blocks.newsletter.submit')}
            </SubmitButton>
        </Form>
    )
}

const Form = styled.form`
    margin: 0;

    @media ${mq.mediumLarge} {
        display: flex;
    }
`

const Email = styled.input`
    display: block;
    padding: ${spacing(0.5)};
    border: none;
    margin-right: ${spacing(0.5)};
    flex-grow: 1;
    width: 100%;
    max-width: 300px;
    background: ${props => (props.isLoading ? props.theme.colors.backgroundAlt2 : props.theme.colors.backgroundAlt)};
    /*
    @include small {
        margin-bottom: $spacing/2;
    }
    @include font-regular;
    &:focus {
        outline: none;
        border-color: $hover-color;
    }
    .Newsletter--loading & {
        background: $grey;
    }
    */
`

const SubmitButton = styled(Button)`
    min-width: 140px;
    display: block;
    @media ${mq.small} {
        margin-top: ${spacing()};
        width: 100%;
    }
    /*
    @include small {
        width: 100%;
    }
    &:hover{
        @include ants;
    }
    */
`

const ErrorFeedback = styled.div`
    padding: ${spacing()};
    margin-bottom: ${spacing()};
    /*
    border: 1px solid $red;
    color: $red;
    */
`

const SuccessFeedback = styled.div`
    border: ${props => props.theme.separationBorder};
    padding: ${spacing()};
`
