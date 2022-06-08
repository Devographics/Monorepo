import React from 'react'
import T from './T'
import LanguageSwitcher from './LanguageSwitcher'

const links = [
    {
        url: 'https://www.devographics.com',
        k: 'general.made_by_devographics'
    },
    {
        url: 'https://www.netlify.com',
        k: 'general.netlify_link'
    },
    {
        url: import.meta.env.ISSUES_URL,
        k: 'general.leave_issue'
    },
    {
        url: import.meta.env.DISCORD_URL,
        k: 'general.join_discord'
    }
]

export default function Footer() {
    return (
        <footer>
            <LanguageSwitcher />
            {links.map(link => (
                <FooterLink key={link.url} {...link} />
            ))}
        </footer>
    )
}

const FooterLink = ({ url, k }) => (
    <a href={url}>
        <T k={k} values={{ url }} html={true} />
    </a>
)
