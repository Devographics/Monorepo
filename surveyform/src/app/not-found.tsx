import Link from "next/link";
import "./not-found.scss";

export default function NotFound() {
  // TODO: this page will also be delivered to the server when requesting on a wrong API endpoint
  // ideally, the not-found should be coupled with a "route.ts" that handles the scenario
  // where "Content-Type" is "application/json"
  return (
    <div className="notfound">
      <p>404 | This page could not be found</p>
      <div>
        <Link href={"/"}>Back to home</Link>
      </div>
    </div>
  );
}
