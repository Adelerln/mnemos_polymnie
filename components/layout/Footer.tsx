import Link from "next/link";

import { knowledgeBaseLinks, supportContacts } from "@/lib/constants";

export const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between md:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
          Support
        </p>
        <ul className="space-y-1">
          {supportContacts.map((contact) => (
            <li key={contact.label}>
              <span className="font-medium text-foreground">{contact.label}</span>{" "}
              <span className="text-muted-foreground">{contact.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
          Documentation
        </p>
        <ul className="space-y-1">
          {knowledgeBaseLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-foreground transition hover:text-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="border-t border-border bg-muted py-4">
      <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground md:px-6 lg:px-8">
        © {new Date().getFullYear()} Mnemos. Tous droits réservés.
      </p>
    </div>
  </footer>
);
