"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarProps = {
  children?: React.ReactNode;
};

export const Sidebar = ({ children }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-border bg-muted/40 transition-all duration-300 md:block",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
      >
        {isOpen ? "Navigation" : "Menu"}
        {isOpen ? (
          <ChevronLeft className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </button>
      <div className="p-3 text-sm text-muted-foreground">{children}</div>
    </aside>
  );
};
