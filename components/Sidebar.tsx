"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { name: "Baseball", href: "/baseball/scores" },
  { name: "Games", href: "/games/math-streak" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-48 shrink-0 border-r border-gray-200 bg-white min-h-screen px-3 py-6">
      <div className="text-lg font-bold text-gray-900 px-2 mb-6">Home Dashboard</div>
      <ul className="space-y-1">
        {SECTIONS.map((section) => {
          const active = pathname.startsWith(section.href.split("/").slice(0, 2).join("/"));
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-red-50 text-red-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {section.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
