import { AsyncLocalStorage } from 'node:async_hooks';


const ctx: { pageName: string } = { pageName: "unknown page" }
/**
 * Global context
 * shared by all instances of i18n debugger
 */
const i18nDebuggerStore = new AsyncLocalStorage<typeof ctx>();
i18nDebuggerStore.enterWith(ctx)


export const i18nDebugger = {
    mustGetStore() {
        const store = i18nDebuggerStore.getStore()
        if (!store) {
            throw new Error("No i18nDebuggerStore in context")
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
