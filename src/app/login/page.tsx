"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserOption {
  id: string;
  name: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserOption[] | null>(null);
  const [newName, setNewName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: UserOption[]) => setUsers(data))
      .catch(() => setError("Could not load users."));
  }, []);

  async function pickUser(user: UserOption) {
    setError(null);
    setBusyId(user.id);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error("Could not log in");
      router.push("/bets/week");
      router.refresh();
    } catch {
      setError("Something went wrong logging in. Try again.");
      setBusyId(null);
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setError(null);
    setBusyId("new");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Could not create user");
      router.push("/bets/week");
      router.refresh();
    } catch {
      setError("Something went wrong creating that name. Try again.");
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="flex items-center gap-1.5 text-xl font-semibold tracking-tight">
          <span aria-hidden className="text-brand-text">
            ⚽
          </span>
          Gamble Gamble Gamble
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Who&apos;s this?</p>

        {error && (
          <p className="mt-3 rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {users === null && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
          {users?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No one&apos;s here yet — add yourself below.
            </p>
          )}
          {users?.map((user) => (
            <button
              key={user.id}
              onClick={() => pickUser(user)}
              disabled={busyId !== null}
              className="w-full rounded-xl border border-border px-4 py-3 text-left font-medium transition hover:border-brand hover:bg-brand-subtle disabled:opacity-50"
            >
              {user.name}
              {busyId === user.id && (
                <span className="ml-2 text-xs text-muted-foreground">signing in…</span>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={createUser} className="mt-5 flex gap-2 border-t border-border pt-5">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={busyId !== null || !newName.trim()}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:bg-brand-strong disabled:opacity-50"
          >
            {busyId === "new" ? "…" : "I'm new"}
          </button>
        </form>
      </div>
    </div>
  );
}
