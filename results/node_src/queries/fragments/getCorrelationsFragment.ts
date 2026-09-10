export const getCorrelationsFragment = () => `_correlations {
    questionCorrelations {
            kind1
            kind2
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
                kind1
                kind2
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
