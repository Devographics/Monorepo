import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const ThreadsIcon = (props: IconProps) => {
    return (
        <IconWrapper {...props}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="round"
            >
                <path d="M17.218 11.197a8 8 0 0 0-.289-.131c-.17-3.13-1.88-4.92-4.75-4.939h-.039c-1.717 0-3.145.733-4.024 2.067l1.579 1.083c.656-.997 1.687-1.209 2.446-1.209h.026c.945.006 1.659.281 2.12.817.336.39.56.93.672 1.61a12 12 0 0 0-2.713-.13c-2.73.156-4.484 1.748-4.366 3.96.06 1.122.618 2.087 1.573 2.718.808.533 1.848.794 2.929.735 1.427-.079 2.547-.623 3.328-1.62.594-.755.969-1.735 1.135-2.97.68.41 1.184.95 1.463 1.6.473 1.104.5 2.918-.98 4.397-1.297 1.296-2.856 1.857-5.212 1.874-2.613-.02-4.59-.858-5.875-2.491-1.204-1.53-1.826-3.74-1.849-6.568.023-2.828.645-5.038 1.849-6.568 1.285-1.633 3.262-2.471 5.875-2.49 2.633.019 4.644.86 5.978 2.502.654.805 1.148 1.818 1.473 2.998l1.85-.493c-.394-1.453-1.015-2.705-1.859-3.744-1.71-2.104-4.212-3.183-7.435-3.205h-.013c-3.217.022-5.691 1.105-7.353 3.217-1.479 1.88-2.242 4.496-2.267 7.775v.016c.025 3.279.788 5.895 2.267 7.775C6.419 21.895 8.893 22.978 12.11 23h.013c2.86-.02 4.876-.769 6.536-2.428 2.173-2.17 2.108-4.892 1.392-6.562-.514-1.198-1.494-2.17-2.833-2.813m-4.938 4.642c-1.197.068-2.44-.47-2.5-1.62-.046-.852.606-1.803 2.573-1.917q.337-.02.664-.02c.714 0 1.382.07 1.99.203-.227 2.83-1.556 3.29-2.727 3.354"></path>
            </svg>
        </IconWrapper>
    )
}
