import { Redis } from '@devographics/redis'
import { Request, Response } from 'express'

export const getLikesHandler = (redisClient: Redis) => async (req: Request, res: Response) => {
    const itemId = req.query.itemId as string
    if (!itemId) {
        return res.status(400).json({ error: 'Missing itemId' })
    }

    const likeKey = `likes:${itemId}`
    const count = (await redisClient.get(likeKey)) as string
    res.status(200).json({ count: parseInt(count ?? '0') })
}
