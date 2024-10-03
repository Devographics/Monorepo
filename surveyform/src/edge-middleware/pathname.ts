
export function getFirstParam(pathname: string) {
    if (!pathname) {
        console.warn("Empty pathname");
        return null;
    }
    const segments = pathname.split("/");
    if (segments.length < 2) {
        return null;
    }
    const firstParam = segments[1];
    return firstParam;
}

export function isApi(pathname: string) {
    return getFirstParam(pathname) === "api";
}

export function isFile(pathname: string) {
    return pathname.includes(".") || getFirstParam(pathname) === "_next";
}
