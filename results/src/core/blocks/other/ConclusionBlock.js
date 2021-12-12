import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'

const ConclusionBlock = () => {
    return (
        <Conclusion className="Conclusion">
            {/* <Title>
                <T k="sections.conclusion.title" />
            </Title>
            <T k="sections.conclusion.description" md={true} /> */}
            The way you write CSS is about to change forever. For many years now, the majority of innovations in writing styles for the web have happened elsewhere, in preprocessors, JavaScript frameworks and compilers, while CSS has been mostly the same. There have been some big changes to be sure, like aspect-ratio, CSS custom properties and the :is and :where pseudoselectors. But for features like loops, variables, nesting, modular styling and theming you had to use an extra tool.

            Though they've had pretty good browser support since 2017, in 2021 we've seen people really take CSS custom properties to a new level and we don't think we're done discovering everything we can do with those. We'll see more clever applications of that throughout 2022 and beyond. 

            But there's a change coming. The core CSS language is getting shaken up and renewed, and we're currently right at the forefront of some big changes. 

            Container queries will bring in an entirely new era of responsive design and Cascade layers will make our use of frameworks, theming and managing complex codebases significantly easier. Those two are nearly here, with implementations to experiment with already available in different browsers.

            When we look a little further ahead, we can see the @when/else conditional coming up, that will let us not only combine media, container and supports queries into a single at-rule, but will also let us define the else condition, saving us all from having to overwrite our own styles.

            And fingers crossed, 2022 is the year we finally see some movement on native CSS nesting. The specification for that is pretty nailed down we think, and those of us that work with things like Sass and PostCSS-preset-env could imagine no other way of working.

            All of this together means that 2022 is likely to be a year where the way you write CSS is going to fundamentally change. It's an incredibly exciting period, and we look forward to all the amazing implementations in the year to come.
        </Conclusion>
    )
}

const Title = styled.h2`
    font-size: ${fontSize('largest')};
`
const Conclusion = styled.div`
    @media ${mq.large} {
        max-width: 700px;
        margin: 0 auto;
        margin-bottom: ${spacing(4)};
    }
    .block__content {
        p:first-child {
            @media ${mq.mediumLarge} {
                max-width: 700px;
                font-size: $larger-font;
            }
        }
    }
`

export default ConclusionBlock
