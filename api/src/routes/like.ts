import { Redis } from '@devographics/redis'
import { Request, Response } from 'express'

export const getLikeHandler = (redisClient: Redis) => async (req: Request, res: Response) => {
    const { itemId, deviceId } = req.body
    const ip = req.ip

    if (!itemId || !deviceId) {
        return res.status(400).json({ error: 'Missing itemId or deviceId' })
    }

    const likeKey = `likes:${itemId}`
    const dedupKey = `liked:${itemId}`

    // Use a composite identifier (e.g. IP + deviceId)
    const userHash = `${ip}-${deviceId}`

    const alreadyLiked = await redisClient.sismember(dedupKey, userHash)
    if (alreadyLiked) {
        const count = (await redisClient.get(likeKey)) as string
        return res.status(200).json({ count: parseInt(count ?? '0') })
    }

    await redisClient.multi().incr(likeKey).sadd(dedupKey, userHash).exec()

    const count = (await redisClient.get(likeKey)) as string
    res.status(200).json({ count: parseInt(count ?? '0') })
}
