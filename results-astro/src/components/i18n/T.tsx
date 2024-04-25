/**
 * TODO: we cannot yet inject translations into React world, see Astro version
 */
export function T({ k }: { k: string }) { return <span>React translation key {k}</span> }
