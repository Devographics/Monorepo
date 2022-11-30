import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
// import ReactMarkdown from 'react-markdown'
import { mq, spacing, fontSize, color } from 'core/theme'
import T from 'core/i18n/T'

const PicksBlock = ({ block, data: entity }) => {
    const { id: pickId, variables } = block
    const { url } = variables
    const { name: fullName, twitter, twitterName } = entity

    return (
        <PicksContainer className="Block">
            <PicksIntroMobile>
                <T k="picks.intro" />
            </PicksIntroMobile>
            <div className="pick">
                <Pick>
                    <PickContentWrapper>
                        <PickContent>
                            <PickTitle>
                                <span>
                                    <T k="picks.my_pick" />
                                </span>
                                {' '}
                                <PickTitleLink href={url}>
                                    <T k={`picks.${pickId}.name`} />
                                </PickTitleLink>
                            </PickTitle>
                            <Description>
                                {/* <ReactMarkdown
                                    source={translate(`picks.${twitterName}.description`, { markdown: true })}
                                /> */}
                                <T k={`picks.${pickId}.description`} md={true} />
                            </Description>
                        </PickContent>
                        <PicksIntro>
                            <T k="picks.intro" />
                        </PicksIntro>
                    </PickContentWrapper>
                    <PickPerson>
                        <PickImage>
                            <div>
                                <a
                                    href={`https://twitter.com/${twitterName}`}
                                    style={{
                                        backgroundImage: `url(${twitter?.avatarUrl})`
                                    }}
                                    title={fullName}
                                >
                                    {fullName}
                                </a>
                            </div>
                        </PickImage>
                        <PickCredit>
                            <PickName>
                                <a href={`https://twitter.com/${twitterName}`}>{fullName}</a>
                            </PickName>
                            <PickBio>
                                <T k={`picks.${pickId}.bio`} md={true} />
                            </PickBio>
                        </PickCredit>
                    </PickPerson>
                </Pick>
            </div>
        </PicksContainer>
    )
}

PicksBlock.propTypes = {
    section: PropTypes.string
}

const PicksContainer = styled.div`
    margin-bottom: ${spacing(2)};
`

const Pick = styled.div`
    margin-bottom: ${spacing(4)};
`

const triangleWidth = 2

const PickContentWrapper = styled.div`
    position: relative;
`
const PickContent = styled.div`
    background: ${color('backgroundInvertedAlt')};
    color: ${color('textInverted')};
    position: relative;
    margin-bottom: ${spacing(0.75)};
    @media ${mq.small} {
        padding: ${spacing(0.75)} ${spacing()} ${spacing()} ${spacing()};
    }
    @media ${mq.mediumLarge} {
        padding: ${spacing(1)} ${spacing(1.5)} ${spacing(1.5)} ${spacing(1.5)};
    }
    &:after {
        content: ' ';
        clip-path: polygon(0 0, 100% 0, 50% 100%);
        background: ${color('backgroundInvertedAlt')};
        position: absolute;
        width: ${spacing(triangleWidth)};
        height: ${spacing(triangleWidth / 2)};
        bottom: -${spacing(triangleWidth / 2)};
        left: ${spacing(triangleWidth)};
    }
`

const PickTitle = styled.h3`
    margin-bottom: ${spacing(0.5)};
    a,
    a:link,
    a:visited,
    a:hover {
        color: ${({ theme }) => theme.colors.textInverted};
    }
`

const PickTitleLink = styled.a`
    text-decoration: underline;
`

const Description = styled.div`
    font-size: ${fontSize('smallish')};
    p {
        margin: 0;
    }
`

const PicksIntroMobile = styled.div`
    font-size: ${fontSize('small')};
    text-align: center;
    margin-bottom: ${spacing(0.5)};
    color: ${({ theme }) => theme.colors.textAlt};
    @media ${mq.mediumLarge} {
        display: none;
    }
`
const PicksIntro = styled.div`
    font-size: ${fontSize('small')};
    text-align: right;
    position: absolute;
    bottom: -30px;
    right: 0;
    color: ${({ theme }) => theme.colors.textAlt};
    @media ${mq.small} {
        display: none;
    }
`

const PickPerson = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 30px;
`

const imageWidth = '60px'

const PickImage = styled.div`
    margin-right: ${spacing(0.75)};
    width: ${imageWidth};

    div {
        background: ${({ theme }) => theme.colors.border};
        border: 2px solid ${({ theme }) => theme.colors.border};
        position: relative;
        z-index: 10;
        overflow: hidden;
        border-radius: 100%;
    }

    a {
        display: block;
        width: 100%;
        padding-bottom: 100%;
        height: 0;
        background-position: center center;
        background-size: cover;
        line-height: 0;
        font-size: 0;
        color: transparent;
        border-radius: 100%;
    }

    img,
    svg {
        display: block;
        width: 100%;
        border: 3px solid white;
    }
`

const PickCredit = styled.div``
const PickName = styled.h4`
    margin: 0;
`
const PickBio = styled.div`
    font-size: ${fontSize('smallish')};
`

export default PicksBlock
