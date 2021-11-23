import { getPageLabel } from 'core/helpers/pageHelpers'
import { useI18n } from 'core/i18n/i18nContext'
// import { useTools } from 'core/helpers/toolsContext'

const PageLabel = ({ page, isContextual, includeWebsite }) => {
    const { translate } = useI18n()
    // const { getToolName } = useTools()

    return getPageLabel(page, translate, { isContextual, includeWebsite })
}

export default PageLabel
