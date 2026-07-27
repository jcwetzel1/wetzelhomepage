"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [{ name: "Math Streak", href: "/games/math-streak" }];

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 bg-white px-6 shrink-0">
        <nav className="flex gap-6">
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
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
