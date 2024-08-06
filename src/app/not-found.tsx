import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col mx-auto p-8">
      <h2 className="text-5xl">Not Found</h2>
      <p>Could not find requested page</p>
      <Link className="underline" href="/">
        Return Home
      </Link>
    </div>
  );
}
