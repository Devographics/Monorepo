import Link from "next/link";

const IndexPage = async ({ params }) => {
  return (
    <div>
      <h2>welcome to surveyadmin</h2>
      <ul>
        <li>
          <Link href="/admin/scripts">Scripts</Link>
        </li>
        <li>
          <Link href="/admin/export">Export</Link>
        </li>
        <li>
          <Link href="/admin/normalization">Normalization</Link>
        </li>
      </ul>
    </div>
  );
};

export default IndexPage;
