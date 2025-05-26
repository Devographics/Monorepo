import { HeartIcon, Heart2Icon } from '@devographics/icons'
import Button from 'core/components/Button'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import React from 'react'

export const CommentsLikes = () => {
    const hasLiked = false
    return (
        <div>
            {/* <Tooltip
                trigger={
                    <Button
                        size="small"
                        className={`comment-like comment-like-${hasLiked ? 'liked' : 'unliked'}`}
                        onClick={() => {
                            alert(1)
                        }}
                    >
                        {hasLiked ? <Heart2Icon size="small" /> : <HeartIcon size="small" />}
                        <span className="comment-like-count">9999</span>
                    </Button>
                }
                showBorder={false}
                contents={<T k="comment.like.description" />}
            /> */}
        </div>
    )
}
