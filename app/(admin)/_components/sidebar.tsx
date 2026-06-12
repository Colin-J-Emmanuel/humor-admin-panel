"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };
type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  { title: "Overview", items: [{ href: "/", label: "Dashboard" }] },
  {
    title: "Users & Content",
    items: [
      { href: "/users", label: "Users" },
      { href: "/images", label: "Images" },
      { href: "/captions", label: "Captions" },
      { href: "/caption-requests", label: "Caption Requests" },
      { href: "/caption-examples", label: "Caption Examples" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    title: "Humor",
    items: [
      { href: "/flavors", label: "Flavors" },
      { href: "/flavor-steps", label: "Flavor Steps" },
      { href: "/humor-mix", label: "Humor Mix" },
    ],
  },
  {
    title: "LLM",
    items: [
      { href: "/llm-models", label: "Models" },
      { href: "/llm-providers", label: "Providers" },
      { href: "/prompt-chains", label: "Prompt Chains" },
      { href: "/llm-responses", label: "Responses" },
    ],
  },
  {
    title: "Access",
    items: [
      { href: "/signup-domains", label: "Signup Domains" },
      { href: "/whitelist-emails", label: "Whitelist Emails" },
    ],
  },
];

export function Sidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="px-5 py-5">
        <Link href="/" className="text-lg font-bold text-gray-900">
          Humor Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-gray-200 px-5 py-4">
        {email && (
          <p className="mb-2 truncate text-xs text-gray-500" title={email}>
            {email}
          </p>
        )}
        <form action="/auth/sign-out" method="POST">
          <button
            type="submit"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}