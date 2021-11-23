export const spacing = (multiplier = 1) => ({ theme }) =>
    `${theme.dimensions.spacing * multiplier}px`

export const fontSize = (size) => ({ theme }) => theme.typography.size[size]

export const fontWeight = (weight) => ({ theme }) => theme.typography.weight[weight]

export const color = (id) => ({ theme }) => theme.colors[id]

export const zIndex = (id) => ({ theme }) => theme.zIndexes[id]
