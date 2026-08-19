"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/bets/upload", label: "Upload" },
  { href: "/bets/week", label: "This Week" },
  { href: "/summary", label: "Summary" },
  { href: "/admin", label: "Admin" },
];

export default function NavBar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function switchUser() {
    await fetch("/api/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface-secondary/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <span className="flex items-center gap-1.5 font-semibold tracking-tight">
          <span aria-hidden className="text-brand-text">
            ⚽
          </span>
          Gamble Gamble Gamble
        </span>
        <button
          onClick={switchUser}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          {userName} <span className="text-muted-foreground/70">· switch</span>
        </button>
      </div>
      <nav className="mx-auto flex max-w-4xl gap-1 px-2 pb-2">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
                active
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-brand-subtle hover:text-brand-text"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
