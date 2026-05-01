"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/scriptwriter", label: "Фабулы" },
  { href: "/scriptwriter/scripts", label: "Сценарии" },
  { href: "/scriptwriter/profiles", label: "Профиль канала" },
];

export default function ScriptwriterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <aside className="w-56 shrink-0 border-r border-[#1e1e1e] bg-[#0a0a0a] px-3 py-6">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">
          AI-сценарист
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/scriptwriter"
                ? pathname === "/scriptwriter"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1e1e1e] text-white"
                    : "text-gray-500 hover:text-gray-300 hover:bg-[#141414]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 px-8 py-8">
        {children}
      </main>
    </div>
  );
}
