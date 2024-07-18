import { redirect } from "@remix-run/node";

export const loader = () => {
  // TODO: improve based on user request
  return redirect("/en-US")
}
export default function Index() {
  return (
    <div>Redirecting to en-US</div>
  );
}
