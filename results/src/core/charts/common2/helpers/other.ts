import { RefObject, useEffect, useState } from 'react'

export const useWidth = (ref: RefObject<HTMLElement>) => {
    const [width, setWidth] = useState<number | undefined>()

    useEffect(() => {
        if (ref.current) {
            setWidth(ref.current.offsetWidth)
        }
    }, []) // The empty dependency array makes sure this runs only once after component mount
    return width
}

export const formatNumber = new Intl.NumberFormat().format
