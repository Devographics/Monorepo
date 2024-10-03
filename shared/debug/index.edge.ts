/**
 * Code that can be imported in Node.js or Vercel Edge Light runtime
 * @see https://runtime-keys.proposal.wintercg.org/
 * @see https://github.com/vercel/next.js/pull/45188
 */
export const logToFile = (...args: any) => {
    if (process.env.NODE_ENV === "development") {
        console.warn("📄 logToFile is a noop in edge environments. Filepath:", args?.[0])
    }
}
export * from "./edge-friendly"