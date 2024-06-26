import { json, Router } from 'express'
import { checkMainPushAction, verifyGhWebhookMiddleware } from './external_apis'
import { reinitialize } from './init'
import { RequestContext } from './types'

/**
 * Hooks to be registered on "/gh"
 *
 * @see https://github.com/Devographics/surveys/settings/hooks
 * @see https://github.com/Devographics/locale-en-US/settings/hooks
 * @see https://github.com/Devographics/entities/settings/hooks
 *
 * @param context
 * @returns an Express router to be registered on "/gh" endpoint
 */
export function ghWebhooks(context: RequestContext): Router {
    const ghRouter = Router()
    ghRouter.use(
        json(),
        verifyGhWebhookMiddleware // important to prevent random people from forcing a reload
    )

    /**
     * @see https://docs.github.com/fr/webhooks
     * @see https://docs.github.com/en/webhooks/using-webhooks/securing-your-webhooks#typescript-example
     */
    ghRouter.post('/reinitialize-surveys', checkMainPushAction, async function (req, res) {
        console.log('Triggering surveys reinitialization from GitHub webhook')
        await reinitialize({ context, initList: ['surveys'] })
        // TODO: check if the push in on main branch
        return res.status(200).send('Surveys reloaded')
    })
    /**
     *
     * @see https://docs.github.com/fr/webhooks
     * @see https://docs.github.com/en/webhooks/using-webhooks/securing-your-webhooks#typescript-example
     */
    ghRouter.post(
        '/reinitialize-entities',
        json(),
        verifyGhWebhookMiddleware, // important
        checkMainPushAction,
        async function (req, res) {
            console.log('Triggering entities reinitialization from GitHub webhook')
            await reinitialize({ context, initList: ['entities', 'surveys'] })
            // TODO: check if the push in on main branch
            return res.status(200).send('Entities (and surveys) reloaded')
        }
    )

    /**
     * @see https://docs.github.com/fr/webhooks
     * @see https://docs.github.com/en/webhooks/using-webhooks/securing-your-webhooks#typescript-example
     */
    ghRouter.post(
        '/reinitialize-locales-github',
        json(),
        verifyGhWebhookMiddleware, // important
        checkMainPushAction,
        async function (req, res) {
            console.log('🟣 Triggering locales reinitialization from GitHub webhook')
            await reinitialize({ context, initList: ['locales'] })
            // TODO: check if the push in on main branch
            return res.status(200).send('Locales reloaded')
        }
    )

    return ghRouter
}
