"use client";

import { useState } from "react";

interface UserOption {
  id: string;
  name: string;
}

export default function AdminUsersList({ users: initialUsers }: { users: UserOption[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete user");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
      setConfirmingId(null);
    }
  }

  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">No users yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger">{error}</p>
      )}
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2"
        >
          <span className="font-medium">{user.name}</span>
          {confirmingId === user.id ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(user.id)}
                disabled={busyId === user.id}
                className="rounded-lg border border-danger/40 bg-danger-subtle px-3 py-1.5 text-sm font-medium text-danger disabled:opacity-50"
              >
                Confirm delete
              </button>
              <button
                onClick={() => setConfirmingId(null)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingId(user.id)}
              className="rounded-lg border border-danger/40 px-3 py-1.5 text-sm font-medium text-danger transition hover:bg-danger-subtle"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
