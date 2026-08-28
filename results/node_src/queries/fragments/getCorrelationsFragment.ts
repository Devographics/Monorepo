export const getCorrelationsFragment = () => `_correlations {
    questionCorrelations {
        questionId1
        sectionId1
        optionId1
        questionId2
        sectionId2
        optionId2
        n
        correlation
        sameSection
        strength
        direction
        }
        optionCorrelations {
        id
        correlations {
            questionId1
            sectionId1
            optionId1
            questionId2
            sectionId2
            optionId2
            n
            correlation
            sameSection
            strength
            direction
        }
        }
    }
`
