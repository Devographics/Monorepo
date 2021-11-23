import React from 'react'
import styled from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import { mq, spacing, fontSize } from 'core/theme'
import Button from 'core/components/Button'
import config from 'Config/config.yml'
import T from 'core/i18n/T'

const { tshirtImages, tshirtLink, tshirtPrice } = config

const TshirtBlock = () => {
    const { translate } = useI18n()

    return (
        <Container>
            <ImagesContainer>
                {tshirtImages.map((image, i) => (
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
            <Description>
                <h2>
                    <T k="tshirt.about" />
                </h2>
                <div>
                    <T k="tshirt.description" md={true} escapeHtml={false} />
                </div>
                <TshirtButton
                    as="a"
                    className="TshirtButton gumroad-button"
                    href={tshirtLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <T k="tshirt.getit" /> – <T k="tshirt.price" values={{ price: tshirtPrice }} />
                </TshirtButton>
            </Description>
        </Container>
    )
}

const Container = styled.div`
    border: ${(props) => props.theme.separationBorder};

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
        border-bottom: ${(props) => props.theme.separationBorder};
    }
    @media ${mq.mediumLarge} {
        border-right: ${(props) => props.theme.separationBorder};
    }

    img {
        display: block;
        width: 100%;
    }
`

const Image = styled.div`
    &:nth-child(1) {
        border-bottom: ${(props) => props.theme.separationBorder};
        grid-column-start: 1;
        grid-column-end: 3;
    }

    &:nth-child(2) {
        border-right: ${(props) => props.theme.separationBorder};
    }
`

const Description = styled.div`
    @media ${mq.small} {
        padding: ${spacing(1)};
    }
    @media ${mq.mediumLarge} {
        padding: ${spacing(2)};
    }
    h2 {
        margin-bottom: ${spacing(0.25)};
    }
    h3 {
        font-size: ${fontSize('medium')};
    }
`

const TshirtButton = styled(Button)`
    &:hover {
        // @include ants;
    }
`

export default TshirtBlock
