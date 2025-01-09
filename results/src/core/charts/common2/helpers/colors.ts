import {
    CUTOFF_ANSWERS,
    DEFAULT,
    INSUFFICIENT_DATA,
    NOT_APPLICABLE,
    NO_ANSWER,
    NO_MATCH,
    OTHER_ANSWERS,
    OVERALL,
    OVERLIMIT_ANSWERS
} from '@devographics/constants'
import { QuestionMetadata } from '@devographics/types'
import { useTheme } from 'styled-components'
import colors from 'Theme/colors'

export const neutralColor = '#ffffff44'
export const neutralColor2 = '#ffffff22'

export type ColorScale = {
    [key: string]: string[]
}

const otherBucketIds = [NO_ANSWER, NO_MATCH, CUTOFF_ANSWERS, OTHER_ANSWERS, OVERLIMIT_ANSWERS]

export const useDefaultColorScale = () => {
    const theme = useTheme()
    const { colors } = theme
    return {
        [DEFAULT]: [colors.velocity[4], colors.velocity[8]],
        [NOT_APPLICABLE]: [neutralColor, neutralColor],
        [NO_ANSWER]: [neutralColor, neutralColor],
        [OVERALL]: [neutralColor, neutralColor],
        [OVERLIMIT_ANSWERS]: [neutralColor, neutralColor],
        [INSUFFICIENT_DATA]: [neutralColor2, neutralColor2]
    } as ColorScale
}

export const useColorScale = ({ question }: { question: QuestionMetadata }) => {
    const theme = useTheme()
    let colorScale = {} as ColorScale
    const defaultColors = useDefaultColorScale()
    const questionScale = colors?.ranges?.[question.id]

    if (questionScale) {
        colorScale = { ...questionScale, ...defaultColors }
    } else {
        colorScale = defaultColors as { [key: string]: string[] }
        if (question.options) {
            if (question.optionsAreSequential || question.optionsAreNumeric) {
                question.options.forEach((option, index) => {
                    const color = theme.colors.velocity[index]
                    colorScale[option.id] = [color, color]
                })
            } else {
                question.options.forEach((option, index) => {
                    if (otherBucketIds.includes(String(option.id))) {
                        colorScale[option.id] = [neutralColor, neutralColor]
                    } else {
                        const color = theme.colors.distinct[index % theme.colors.distinct.length]
                        colorScale[option.id] = [color, color]
                    }
                })
            }
        }
    }
    return colorScale
}

export const useGradient = ({ question, id }: { question?: QuestionMetadata; id: string }) => {
    if (!question) {
        return [neutralColor, neutralColor]
    } else {
        const colorScale = useColorScale({ question })
        const color = colorScale[id]
        if (color) {
            return color
        } else {
            // console.warn(
            //     `Could not find color for cell id ${id} in colorScale ${JSON.stringify(colorScale)}`
            // )
            return [neutralColor, neutralColor]
        }
    }
}
