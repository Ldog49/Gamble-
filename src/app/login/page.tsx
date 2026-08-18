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
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold">PL Bet Tracker</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Who&apos;s this?
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {users === null && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
          )}
          {users?.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No one&apos;s here yet — add yourself below.
            </p>
          )}
          {users?.map((user) => (
            <button
              key={user.id}
              onClick={() => pickUser(user)}
              disabled={busyId !== null}
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-left font-medium transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              {user.name}
              {busyId === user.id && (
                <span className="ml-2 text-xs text-zinc-400">signing in…</span>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={createUser} className="mt-5 flex gap-2 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="submit"
            disabled={busyId !== null || !newName.trim()}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            {busyId === "new" ? "…" : "I'm new"}
          </button>
        </form>
      </div>
    </div>
  );
}
