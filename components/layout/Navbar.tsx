"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="w-full overflow-x-auto">
      <ul className="flex w-full items-center gap-4 text-xs font-bold uppercase tracking-[0.12em]">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.label} className="flex-shrink-0 whitespace-nowrap">
              <Link
                href={item.href}
                className={cn(
                  "block border-b-2 border-transparent pb-2 text-white/70 transition hover:text-white",
                  isActive && "border-white text-white"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
