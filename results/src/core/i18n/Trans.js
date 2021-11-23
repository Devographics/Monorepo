import PropTypes from 'prop-types'
import { useI18n } from './i18nContext'

const Trans = ({ children }) => {
    const { translate } = useI18n()

    return children(translate)
}

Trans.propTypes = {
    children: PropTypes.func.isRequired,
}

export default Trans
