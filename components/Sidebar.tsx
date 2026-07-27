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
    <nav className="shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 bg-white px-3 py-2 sm:py-6 sm:w-48 sm:h-full">
      <div className="hidden sm:block text-lg font-bold text-gray-900 px-2 mb-6">
        Home Dashboard
      </div>
      <ul className="flex flex-row gap-1 sm:flex-col sm:gap-0 sm:space-y-1 overflow-x-auto">
        {SECTIONS.map((section) => {
          const active = pathname.startsWith(section.href.split("/").slice(0, 2).join("/"));
          return (
            <li key={section.href} className="shrink-0">
              <Link
                href={section.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
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
