import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import TextBlock from 'core/blocks/other/TextBlock'

const NotFoundBlock = () => {
    const { translate } = useI18n()

    return <TextBlock text={translate('notfound.description')} />
}

export default NotFoundBlock
