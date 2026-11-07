export const getColor = (colorRange, id) => {
    if (!colorRange) {
        return
    }
    const color = colorRange[id]
    if (Array.isArray(color)) {
        return { color: color[0], gradient: color }
    } else {
        return { color, gradient: [color, color] }
    }
}
