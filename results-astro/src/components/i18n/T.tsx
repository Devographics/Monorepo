import { TK_ATTR } from "./attributes";

/**
 * TODO: we cannot yet inject translations into React world, see Astro version
 */
export function T({ k }: { k: string }) { return <span {...{ [TK_ATTR]: k }}>React translation key {k}</span> }
