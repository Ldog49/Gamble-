import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toBetDTO } from "@/lib/serialize";
import { getCurrentUser } from "@/lib/session";
import { isAdminUser } from "@/lib/admin";
import AdminUsersList from "@/components/admin/AdminUsersList";
import AdminBetsList from "@/components/admin/AdminBetsList";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user.name)) {
    redirect("/bets/week");
  }

  const [users, bets] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.bet.findMany({
      include: { user: true },
      orderBy: [{ gameweek: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Admin</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Users</h2>
        <AdminUsersList users={users.map((u) => ({ id: u.id, name: u.name }))} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">All bets</h2>
        <AdminBetsList bets={bets.map(toBetDTO)} />
      </section>
    </div>
  );
}
