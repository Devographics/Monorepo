import React from 'react'
import PageHeader from 'core/pages/PageHeader'
import PageFooter from 'core/pages/PageFooter'
import { usePageContext } from 'core/helpers/pageContext'
import BlockWrapper from 'core/blocks/block/BlockWrapper'

const PageTemplate = ({ pageContext = {} }) => {
    const context = usePageContext()
    const { pageData, showTitle = true, is_hidden = false, isCapturing } = pageContext
    return (
        <>
            {showTitle && <PageHeader />}
            <div className="Page__Contents">
                {context.blocks &&
                    context.blocks.map((block, i) => (
                        <BlockWrapper key={`${block.id}_${i}`} isCapturing={isCapturing} block={block} pageData={pageData} index={i} />
                    ))}
            </div>
            {!is_hidden && <PageFooter />}
        </>
    )
}

export default PageTemplate
