import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import NavBar from "@/components/nav/NavBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <NavBar userName={user.name} />
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 pb-24">{children}</main>
    </>
  );
}
