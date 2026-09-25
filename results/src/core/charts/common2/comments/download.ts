import React from 'react'

export const getDownloadHandler = <T>(data: T[], fileName: string) => {
    return (e: React.MouseEvent) => {
        e.preventDefault()
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        })
        console.log(data)
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName}.json`
        link.click()
        URL.revokeObjectURL(url)
    }
}
