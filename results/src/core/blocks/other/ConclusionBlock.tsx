import React from 'react'
import T from 'core/i18n/T'
import CreditItem from 'core/blocks/other/CreditItem'
import { usePageContext } from 'core/helpers/pageContext'
import './Conclusion.scss'

const ConclusionBlock = ({ block, data: author }) => {
    const { currentEdition } = usePageContext()
    const { variables } = block
    const { showConclusion = true } = variables
    if (!author) {
        return null
    }
    return (
        <div className="conclusion-block">
            <div className="conclusion-heading">
                {/* <Title>
                    <T k="sections.conclusion.title" />
                </Title> */}
                <CreditItem
                    id={author?.id}
                    entity={author}
                    labelId={`conclusion.${currentEdition.id}.${author.id}.bio`}
                />
            </div>
            {showConclusion && (
                <T
                    k={`conclusion.${currentEdition.id}.${author.id}`}
                    md={true}
                    fallback={variables.contents}
                />
            )}
        </div>
    )
}

export default ConclusionBlock
