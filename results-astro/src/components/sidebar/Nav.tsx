//import { getPageLabelKey } from "@/lib/sitemap"
import { usePageContext } from "../layouts/PageContext"
import { useTeapot } from "@devographics/react-i18n"


// TODO: should be in survey config not hard written here
/*
const excludedTemplatesAndIds = [
'survey_intro',
'sponsors',
'credits',
'survey_newsletter',
'survey_translators',
'page_introduction',
'hint',
'recommended_resources',
'picks',
'conclusion',
'conclusion_newsletter'
]*/

const NavItem = ({
    currentPath,
    closeSidebar,
    // isHidden = false,
    // depth = 0
}: {
    currentPath: string
    closeSidebar: () => void
    isHidden?: boolean
    depth?: number
}) => {
    const pageContext = usePageContext()
    const { locale } = useTeapot()

    /*
    TODO: reenable this logic
    const isActive = currentPath.indexOf(page.path) !== -1
    const hasChildren = page.children && page.children.length > 0
    const displayChildren = hasChildren > 0 && isActive

    const match = useMatch(`${get(pageContext, 'locale.id')}${parentPage?.path ?? ''}${page.path}`)

    */

    const currentPageBlocks = pageContext.pageDefinition.blocks
        .map(b => b.variants?.[0])
    /*.filter(
        b =>
            !(
                excludedTemplatesAndIds.includes(b.id) ||
                excludedTemplatesAndIds.includes(b.template) ||
                b.hidden
            )
    )*/
    const match = false

    return (
        <div>
            <a
                className={match ? '_is-active' : undefined}
                href={`/${locale.id}${currentPath}`}
            // page={page}
            // depth={depth}
            // isHidden={isHidden}
            // parentPage={parentPage}
            >
                <span>/{locale.id}{currentPath}</span>
            </a>
        </div>
    )
}
export const Nav = ({ closeSidebar }: { closeSidebar: () => void }) => {
    const { sitemap } = usePageContext()
    const visiblePages = sitemap//sitemap.filter(page => !page.is_hidden) ?? []

    return (
        <div>
            {visiblePages.map((page, idx) => {
                console.log(page.path)
                return (
                    <NavItem
                        key={idx}
                        currentPath={page.path}
                        // page={page}
                        // currentPath={context.currentPath}
                        closeSidebar={closeSidebar}
                    />
                )
            })}
        </div>
    )
}