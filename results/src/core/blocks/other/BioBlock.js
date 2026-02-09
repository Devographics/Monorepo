import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'

const BioBlock = ({ subheading, heading, photo, bio }) => {
    return (
        <Bio className="Bio">
            {subheading && <h3 className="BioSubHeading">{subheading}</h3>}
            <BioContent className="BioContent">
                <BioPhoto className="BioPhoto">
                    <img src={photo} alt={heading} />
                </BioPhoto>
                <BioBio className="BioBio">
                    <BioHeading
                        className="BioHeading"
                        dangerouslySetInnerHTML={{ __html: heading }}
                    />
                    {bio}
                </BioBio>
            </BioContent>
        </Bio>
    )
}

const Bio = styled.div`
    background: ${({ theme }) => theme.colors.backgroundAlt};
    margin-top: ${spacing(2)};
    box-shadow: ${({ theme }) => theme.blockShadow};
`

const BioHeading = styled.h3`
    margin-bottom: ${spacing(0.33)};
`

const BioContent = styled.div`
    @media ${mq.large} {
        display: grid;
        grid-template-columns: 170px auto;
    }

    p:last-child {
        margin: 0;
    }
`

const BioBio = styled.div`
    padding: ${spacing()};
    font-size: ${fontSize('smallish')};
`

const BioPhoto = styled.div`
    overflow: hidden;

    @media ${mq.smallMedium} {
        max-width: 120px;
        margin: 0 auto;
        padding-top: ${spacing()};
    }

    img {
        display: block;
        width: 100%;
    }
`

export default BioBlock
