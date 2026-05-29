import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Not authorized
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          You&apos;re signed in, but this area is restricted to superadmins.
          If you think this is a mistake, contact the project owner.
        </p>
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}