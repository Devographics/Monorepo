import React from 'react'

export const fontList = ['IBM+Plex+Mono:300,300i,500,600', 'Bebas+Neue&display=swap']

/*

Note: cannot currently import JSX component because of this Helmet warning:

"You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information."

*/

const Fonts = () => {
    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin />
            {fontList.map(font => (
                <link
                    key={font}
                    href={`https://fonts.googleapis.com/css?family=${font}`}
                    rel="stylesheet"
                />
            ))}
        </>
    )
}

export default Fonts
