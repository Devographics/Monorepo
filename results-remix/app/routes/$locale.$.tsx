import { useParams } from "@remix-run/react"

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "New Remix App" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

export default function Page() {
    const params = useParams()
    const { locale } = params
    const pagePath = params["*"]
    return <div>
        <div>Current locale in page: {locale}</div>
        <div>Current path: {pagePath} </div>
    </div>
}