import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import ModalTrigger from 'core/components/ModalTrigger'
import { SponsorIcon } from '@devographics/icons'
import { getBlockMeta } from 'core/helpers/blockHelpers'
import { useI18n } from '@devographics/react-i18n'
import Button from 'core/components/Button'
import {
    AccordionRoot,
    AccordionItem,
    AccordionTrigger,
    AccordionContent
} from 'core/components/Accordion'
import { BlockVariantDefinition } from 'core/types'
import { SponsorProduct } from 'core/types/sponsors'

const faqItems = ['usage', 'public', 'refund', 'influence', 'feedback']

const baseAmount = 10

const SponsorPrompt = ({
    product,
    block
}: {
    product: SponsorProduct
    block: BlockVariantDefinition
}) => (
    <div>
        <ModalTrigger
            trigger={
                <SponsorIconWrapper>
                    <SponsorIcon
                        // @ts-ignore
                        size="small"
                        enableTooltip={true}
                        labelId="sponsor.sponsor_button"
                    />
                </SponsorIconWrapper>
            }
        >
            <SponsorModal product={product} block={block} />
        </ModalTrigger>
    </div>
)

const SponsorIconWrapper = styled(Button)`
    display: block;
    height: 24px;
    width: 24px;
    border-radius: 100%;
    /* background: ${({ theme }) => theme.colors.backgroundAlt}; */
    /* border: 2px solid ${({ theme }) => theme.colors.borderAlt2}; */
    display: grid;
    place-items: center;
    /* padding: 4px; */
    margin-left: ${spacing(0.5)};
    padding: 0px;
    opacity: 0.4;
    &:hover {
        opacity: 1;
    }
    cursor: pointer;
    svg {
        color: ${({ theme }) => theme.colors.border};
    }
`

const SponsorModal = ({
    product,
    block
}: {
    product: SponsorProduct
    block: BlockVariantDefinition
}) => {
    const pageContext = usePageContext()
    const { getString } = useI18n()
    const meta = getBlockMeta({ block, pageContext, getString })

    return (
        <ModalContents>
            <ModalHeader>
                <Contents>
                    <Title>
                        <T k="sponsor.sponsor_chart.title" values={{ title: meta.title }} />
                    </Title>
                    <Description>
                        <T k="sponsor.sponsor_chart.description" md={true} html={true} />
                    </Description>
                    {product.add_to_cart_url ? (
                        <SponsorButton as="a" href={product.add_to_cart_url} target="_blank">
                            <T k="sponsor.sponsor_this_chart" values={{ baseAmount }} />
                        </SponsorButton>
                    ) : (
                        <span>Error: Missing Product "{product.chartId}"</span>
                    )}
                </Contents>

                <Chart>
                    <ImageWrapper>
                        <Image src={meta.imageUrl} />
                    </ImageWrapper>
                    <ChartId>
                        <T k="sponsor.chart_id" /> <ChartIdCode>{product.chartId}</ChartIdCode>
                    </ChartId>
                </Chart>
            </ModalHeader>
            <ModalBody>
                <Left>
                    <HowItWorks>
                        <T k="sponsor.how_it_works.title" md={true} html={true} />
                    </HowItWorks>
                    <HowItWorksContents>
                        <T k="sponsor.how_it_works.description" md={true} html={true} />
                    </HowItWorksContents>
                </Left>
                <Right>
                    <AccordionRoot type="single" collapsible>
                        {faqItems.map(faqId => (
                            <FaqItem key={faqId} faqId={faqId} />
                        ))}
                    </AccordionRoot>
                </Right>
            </ModalBody>
        </ModalContents>
    )
}

const ModalContents = styled.div``

const ModalHeader = styled.div`
    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: 1fr 300px;
        column-gap: ${spacing(2)};
    }

    /* padding-bottom: ${spacing()}; */
    margin-bottom: ${spacing(2)};
    /* border-bottom: 1px dashed ${({ theme }) => theme.colors.border}; */
    background: ${({ theme }) => theme.colors.backgroundInverted};
    color: ${({ theme }) => theme.colors.textInverted};
    padding: ${spacing()};
    border-radius: 4px;
    box-shadow: 6px 6px 0px 0px ${({ theme }) => theme.colors.backgroundAlt2},
        12px 12px 0px 0px ${({ theme }) => theme.colors.background};
`
const Contents = styled.div``

const Title = styled.h2`
    margin-bottom: ${spacing(0.5)};
`
const Description = styled.div`
    margin-bottom: ${spacing(0.5)};
`
const SponsorButton = styled(Button)`
    margin-bottom: ${spacing(0.5)};
    &,
    &:link,
    &:visited {
        color: ${({ theme }) => theme.colors.textInverted};
        border-color: ${({ theme }) => theme.colors.textInverted};
    }
    &:hover {
        color: ${({ theme }) => theme.colors.link};
        border-color: ${({ theme }) => theme.colors.link};
        box-shadow: none;
    }
`

const ModalBody = styled.div`
    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: 2fr 1fr;
        column-gap: ${spacing(2)};
    }
`

const Left = styled.div``

const Right = styled.div``

const Chart = styled.div``
const ImageWrapper = styled.div`
    width: 100%;
    max-height: 180px;
    overflow: hidden;
    border-radius: 3px;
    margin-bottom: ${spacing(0.5)};
    border: 6px solid ${({ theme }) => theme.colors.borderAlt};
    position: relative;
`
const Image = styled.img`
    display: block;
    width: 100%;
`

export const ChartId = styled.div`
    font-size: ${fontSize('small')};
    /* color: ${({ theme }) => theme.colors.textAlt}; */
    text-align: center;
`

export const ChartIdCode = styled.code`
    /* border: 1px solid ${({ theme }) => theme.colors.border}; */
    background: ${({ theme }) => theme.colors.backgroundInvertedAlt};
    padding: 3px 6px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textInvertedAlt};
`

const HowItWorks = styled.h3``
const HowItWorksContents = styled.div`
    font-size: ${fontSize('smallish')};
`

const FaqItem = ({ faqId }: { faqId: string }) => (
    <AccordionItem value={faqId}>
        <AccordionTrigger>
            <T k={`sponsor.faq.${faqId}.title`} />
        </AccordionTrigger>
        <AccordionContent>
            <T k={`sponsor.faq.${faqId}.description`} md={true} html={true} />
        </AccordionContent>
    </AccordionItem>
)

export default SponsorPrompt
