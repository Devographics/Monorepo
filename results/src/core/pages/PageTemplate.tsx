import React from 'react'
import PageHeader from 'core/pages/PageHeader'
import PageFooter from 'core/pages/PageFooter'
import { usePageContext } from 'core/helpers/pageContext'
import BlockWrapper from 'core/blocks/block/BlockWrapper'

const PageTemplate = () => {
    const context = usePageContext()
    const { showTitle = true, is_hidden = false } = context
    return (
        <>
            {showTitle && <PageHeader />}
            <main className="Page__Contents">
                {context.blocks &&
                    context.blocks.map((block, i) => (
                        <BlockWrapper key={`${block.id}_${i}`} block={block} index={i} />
                    ))}
            </main>
            {!is_hidden && <PageFooter />}
        </>
    )
}

export default PageTemplate
