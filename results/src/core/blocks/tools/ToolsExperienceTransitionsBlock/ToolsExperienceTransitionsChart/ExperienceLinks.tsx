import React, { memo, useMemo } from 'react'
import { useSpring, animated, config } from '@react-spring/web'
import { ToolExperienceId } from 'core/bucket_keys'
import { SankeyLinkDatum } from '../types'
import { LinkWithGradient} from './LinkWithGradient'

export const NonMemoizedExperienceLinks = ({
    uid,
    experience,
    links,
    isActive
}: {
    uid: number
    experience: ToolExperienceId
    links: SankeyLinkDatum[]
    isActive: boolean
}) => {
    const maskId = `${experience}LinksMask${uid}`
    const maxWidth = useMemo(() => Math.max(...links.map((link) => link.target.x0)), [links])
    const maskStyles = useSpring({
        width: isActive ? maxWidth : 0,
        opacity: isActive ? 1 : 0,
        config: config.slow,
    })

    return (
        <>
            <mask id={maskId}>
                <animated.rect
                    width={maskStyles.width}
                    height={1000}
                    fill="white"
                />
            </mask>
            <animated.g
                mask={`url(#${maskId})`}
                opacity={maskStyles.opacity}
            >
                {links.map((link) => (
                    <LinkWithGradient
                        key={`${link.source.id}.${link.target.id}`}
                        link={link}
                    />
                ))}
            </animated.g>
        </>
    )
}

export const ExperienceLinks = memo(NonMemoizedExperienceLinks)
