import React from 'react'
import T from 'core/i18n/T'
import { BlockVariantDefinition } from '@devographics/types'
import Button from 'core/components/Button'
import Link from 'core/components/LocaleLink'
import './CTABlock.scss'

const CTABlock = ({ block }: { block: BlockVariantDefinition }) => {
    const { variables = {} } = block
    const { ctaKey, ctaLink } = variables
    return (
        <div className="cta-block">
            <Button as={Link} to={ctaLink}>
                <T k={ctaKey} />
            </Button>
        </div>
    )
}

export default CTABlock
