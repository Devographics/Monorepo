import Link from "next/link";
import "./not-found.scss";

export default function NotFound() {
  return (
    <div className="notfound">
      <p>404 | This page could not be found</p>
      <div>
        <Link href={"/"}>Back to home</Link>
      </div>
    </div>
  );
}
