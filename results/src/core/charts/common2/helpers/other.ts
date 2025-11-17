import { RefObject, useEffect, useState } from 'react'

export const useWidth = (ref: RefObject<HTMLElement>) => {
    const [width, setWidth] = useState<number | undefined>()

    // TODO: replace this with a ResizeObserver
    useEffect(() => {
        let lastWidth = -1
        const int = setInterval(() => {
            const width = ref.current?.offsetWidth ?? -1
            if (lastWidth !== width) {
                lastWidth = width
                setWidth(lastWidth)
            }
        }, 10)
        return () => clearInterval(int)
    }, []) // The empty dependency array makes sure this runs only once after component mount
    return width
}

export const useHeight = (ref: RefObject<HTMLElement>) => {
    const [height, setHeight] = useState<number | undefined>()

    useEffect(() => {
        if (ref.current) {
            setHeight(ref.current.offsetHeight)
        }
    }, []) // The empty dependency array makes sure this runs only once after component mount
    return height
}
