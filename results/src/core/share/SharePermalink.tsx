import React from 'react'
import styled from 'styled-components'
import mq from 'core/theme/mq'
import { useI18n } from '@devographics/react-i18n'
import { getBlockMeta } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockVariantDefinition } from 'core/types'

const Link = styled.a`
    float: left;
    opacity: 0.5;
    &:focus,
    &:hover {
        opacity: 1;
    }
    line-height: 1;
    width: 22px;
    margin-left: -30px;
    margin-right: 8px;
    transition: none;
    position: relative;

    @media ${mq.small} {
        /* top: 3px; */
        display: none;
    }
    @media ${mq.mediumLarge} {
        top: 1px;
    }

    path {
        fill: rgba(255, 255, 255, 0.4);
    }
`

const SharePermalink = ({ block }: { block: BlockVariantDefinition }) => {
    const { getString } = useI18n()
    const pageContext = usePageContext()
    const blockMeta = getBlockMeta({ block, pageContext, getString })
    console.log(blockMeta)
    return (
        <Link
            // onClick={track('Permalink', trackingId)}
            className="SharePermalink share__link"
            href={blockMeta.link}
            rel="noopener noreferrer"
            id={block.id}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <g id="Filled_Icons_1_">
                    <g id="Filled_Icons">
                        <path d="M14.474,10.232l-0.706-0.706C12.208,7.966,9.67,7.964,8.11,9.525l-4.597,4.597c-1.56,1.56-1.56,4.097,0,5.657 l0.707,0.706c0.756,0.757,1.76,1.173,2.829,1.173c1.068,0,2.072-0.417,2.827-1.172l2.173-2.171c0.391-0.391,0.391-1.024,0-1.414 c-0.391-0.392-1.023-0.392-1.414,0l-2.173,2.17c-0.755,0.756-2.071,0.757-2.828,0l-0.707-0.706c-0.779-0.781-0.779-2.049,0-2.829 l4.597-4.596c0.756-0.756,2.073-0.756,2.828,0l0.707,0.707c0.391,0.391,1.023,0.391,1.414,0 C14.864,11.256,14.864,10.623,14.474,10.232z" />
                        <path d="M20.486,4.221l-0.707-0.706c-0.756-0.757-1.76-1.173-2.829-1.173c-1.068,0-2.072,0.418-2.827,1.172L12.135,5.5 c-0.391,0.391-0.391,1.024,0,1.414c0.391,0.392,1.023,0.392,1.414,0l1.988-1.984c0.755-0.756,2.071-0.757,2.828,0l0.707,0.706 c0.779,0.78,0.779,2.049,0,2.829l-4.597,4.596c-0.756,0.756-2.073,0.756-2.828,0c-0.391-0.391-1.024-0.391-1.414,0 c-0.391,0.391-0.392,1.023-0.001,1.414c1.56,1.562,4.098,1.562,5.657,0.001l4.597-4.597C22.046,8.319,22.046,5.781,20.486,4.221z" />
                    </g>
                </g>
                <rect fill="none" width="24" height="24" id="Frames-24px" />
            </svg>
            <span className="sr-only">{getString('share.link')?.t}</span>
        </Link>
    )
}

export default SharePermalink
