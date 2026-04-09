import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    // If not admin, redirect to store
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-black text-foreground">
      {/* Sidebar (desktop only — mobile uses fixed bottom nav in AdminSidebar) */}
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-[4.5rem] md:pt-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
