import { scaleLinear } from 'd3-scale'

/*

For a given set of points, get the total velocity between start and finish

*/
export const getVelocity = (points) => {
    const first = points[0]
    const last = points[points.length - 1]
    const vx = last[0] - first[0]
    const vy = last[1] - first[1]
    const v = vx + vy
    return v
}

/*

For a given velocity and a theme, get the associated color

*/
export const getVelocityColor = (v, theme) => {
    const scale = theme.colors.arrowsVelocity
    const scaleSteps = scale.length - 1
    const stepValue = Math.round(((v + 100) * scaleSteps) / 200)
    // add a floor and ceiling to make sure the step stays "inside" the array
    const stepIndex = Math.max(0, Math.min(stepValue, scaleSteps))
    return scale[stepIndex]
}

/*

For a given velocity and a theme, get the associated color scale

*/
export const getVelocityColorScale = (v, theme) => {
    const color = getVelocityColor(v, theme)
    return scaleLinear().domain([1, 0]).range([color, '#303652']).clamp(true)
}
