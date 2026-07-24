"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { name: "Minor League Scores", href: "/baseball/scores" },
  { name: "Top Prospects", href: "/baseball/prospects" },
];

export default function BaseballLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="border-b border-gray-200 bg-white px-6">
        <nav className="flex gap-6 max-w-3xl mx-auto">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`py-3 text-sm font-medium border-b-2 ${
                  active
                    ? "border-red-600 text-red-700"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
