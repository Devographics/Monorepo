import { Outlet, useParams } from "@remix-run/react";

export default function Layout() {
    const { locale } = useParams()
    return <div>
        Current locale in layout: {locale}
        <Outlet />
    </div>

}