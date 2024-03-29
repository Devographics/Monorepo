import { DEFAULT, NOT_APPLICABLE, NO_ANSWER, OVERALL } from '@devographics/constants'
import { QuestionMetadata } from '@devographics/types'
import { useTheme } from 'styled-components'
import colors from 'Theme/colors'

export const neutralColor = '#ffffff33'

export type ColorScale = {
    [key: string]: string[]
}

export const useDefaultColorScale = () => {
    const theme = useTheme()
    return {
        [DEFAULT]: [theme.colors.velocity[4], theme.colors.velocity[8]],
        [NOT_APPLICABLE]: [neutralColor, neutralColor],
        [NO_ANSWER]: [neutralColor, neutralColor],
        [OVERALL]: [neutralColor, neutralColor]
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
            if (question.optionsAreSequential) {
                question.options.forEach((option, index) => {
                    const color = theme.colors.velocity[index]
                    colorScale[option.id] = [color, color]
                })
            } else {
                question.options.forEach((option, index) => {
                    const color = theme.colors.distinct[index % theme.colors.distinct.length]
                    colorScale[option.id] = [color, color]
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
