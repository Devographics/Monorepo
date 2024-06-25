import { AsyncLocalStorage } from 'node:async_hooks';


const ctx: { pageName: string } = { pageName: "unknown page" }
/**
 * Global context
 * shared by all instances of i18n debugger
 */
const nodeDebuggerStore = new AsyncLocalStorage<typeof ctx>();
nodeDebuggerStore.enterWith(ctx)


/**
 * Usable in Next.js but also in Node.js shared packages
 * 
 * If setting a context stricly scoped to Next.js code,
 * use React "cache" as a server context instead
 * 
 * Not usable in edge environement
 */
export const nodeDebuggerCtx = {
    run(cb: () => unknown) {
        nodeDebuggerStore.run(ctx, cb)
    },
    mustGetStore() {
        const store = nodeDebuggerStore.getStore()
        if (!store) {
            // This should not happen, no idea why it could happen.
            throw new Error("No nodeDebuggerCtx store in context.")
        }
        return store

    },
    setPageName(pageName: string) {
        const store = this.mustGetStore()
        store.pageName = pageName
    },
    getPageName() {
        return this.mustGetStore().pageName
    }
}
