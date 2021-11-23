import React from 'react'
import { Link } from 'gatsby'
import { usePageContext } from 'core/helpers/pageContext'
import get from 'lodash/get'

const LocaleLink = ({ to, ...rest }) => {
    const context = usePageContext()
    return <Link {...rest} to={`${get(context, 'locale.path')}${to}`} />
}

export default LocaleLink
