import { apiRoutes } from "~/lib/apiRoutes";

export async function logout() {
    return await fetch(apiRoutes.account.logout.href(), {
        method: "POST",
    });
}