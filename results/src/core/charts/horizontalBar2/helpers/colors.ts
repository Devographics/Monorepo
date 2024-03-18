import { NOT_APPLICABLE, NO_ANSWER } from '@devographics/constants'
import { QuestionMetadata } from '@devographics/types'
import { useTheme } from 'styled-components'
import colors from 'Theme/colors'

export const defaultColor = '#ffffff33'

export const useColorScale = ({ question }: { question: QuestionMetadata }) => {
    const theme = useTheme()
    const chartScale = colors?.ranges?.[question.id]
    const defaultColors = {
        [NOT_APPLICABLE]: [defaultColor, defaultColor],
        [NO_ANSWER]: [defaultColor, defaultColor]
    }
    if (chartScale) {
        return { ...chartScale, ...defaultColors }
    } else {
        const chartScale = defaultColors as { [key: string]: string[] }
        if (question.options) {
            if (question.optionsAreSequential) {
                question.options.forEach((option, index) => {
                    const color = theme.colors.velocity[index]
                    chartScale[option.id] = [color, color]
                })
            } else {
                question.options.forEach((option, index) => {
                    const color = theme.colors.distinct[index]
                    chartScale[option.id] = [color, color]
                })
            }
        }
        return chartScale
    }
}

export const useColor = ({ question, id }: { question?: QuestionMetadata; id: string }) => {
    if (!question) {
        return
    } else {
        const colorScale = useColorScale({ question })
        const color = colorScale[id]
        if (color) {
            return color[0]
        } else {
            console.warn(
                `Could not find color for cell id ${id} in colorScale ${JSON.stringify(colorScale)}`
            )
            return defaultColor
        }
    }
}
