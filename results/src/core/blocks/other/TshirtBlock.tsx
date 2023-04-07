import React from 'react'
import styled from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import { mq, spacing, fontSize } from 'core/theme'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import take from 'lodash/take'
import { usePageContext } from 'core/helpers/pageContext'

const TshirtBlock = () => {
    const { translate } = useI18n()
    const context = usePageContext()
    const { currentEdition } = context
    const { tshirt } = currentEdition
    const { images, url, price, designerUrl } = tshirt
    return (
        <Container>
            <ImagesContainer>
                {take(images, 1).map((image, i) => (
                    <Image key={i}>
                        <a
                            href={`/images/tshirt/${image}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={`/images/tshirt/${image}`}
                                alt={translate('sections.tshirt.title')}
                            />
                        </a>
                    </Image>
                ))}
            </ImagesContainer>
            <DescriptionContainer>
                <Description>
                    {/* <h2>
                        <T k="tshirt.about" />
                    </h2> */}
                    <DescriptionIntro>
                        <T k="tshirt.description" md={true} escapeHtml={false} />
                    </DescriptionIntro>
                    <TshirtButton
                        as="a"
                        className="TshirtButton gumroad-button"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <T k="tshirt.getit" /> – <T k="tshirt.price" values={{ price }} />
                    </TshirtButton>
                </Description>
                <Designer>
                    <h5>
                        <T k="tshirt.designer.heading" />
                    </h5>
                    <h3>
                        <a href={designerUrl}>
                            <T k="tshirt.designer.name" />
                        </a>
                    </h3>
                    <p>
                        <T k="tshirt.designer.bio" md={true} escapeHtml={false} />
                    </p>
                </Designer>
            </DescriptionContainer>
        </Container>
    )
}

const Container = styled.div`
    border: ${props => props.theme.separationBorder};

    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
`

const ImagesContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;

    @media ${mq.small} {
        border-bottom: ${props => props.theme.separationBorder};
    }
    @media ${mq.mediumLarge} {
        border-right: ${props => props.theme.separationBorder};
    }

    img {
        display: block;
        width: 100%;
    }
`

const Image = styled.div`
    &:nth-child(1) {
        /* border-bottom: ${props => props.theme.separationBorder}; */
        grid-column-start: 1;
        grid-column-end: 3;
    }

    &:nth-child(2) {
        border-right: ${props => props.theme.separationBorder};
    }
`

const DescriptionContainer = styled.div`
    @media ${mq.small} {
        padding: ${spacing(1)};
    }
    @media ${mq.mediumLarge} {
        padding: ${spacing(1.5)};
    }
`

const Description = styled.div`
    h2 {
        margin-bottom: ${spacing(0.25)};
    }
    h3 {
        font-size: ${fontSize('medium')};
    }
`

const DescriptionIntro = styled.div`
    margin-bottom: ${spacing()};
`

const TshirtButton = styled(Button)`
    &:hover {
        // @include ants;
    }
`

const Designer = styled.div`
    margin-top: ${spacing()};
    background: ${props => props.theme.colors.backgroundAlt};
    padding: ${spacing(1)};
    h5,
    h3 {
        margin-bottom: ${spacing(0.25)};
    }
    p {
        font-size: ${fontSize('smallish')};
        margin: 0;
    }
`

export default TshirtBlock
