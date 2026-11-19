import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/navigation/app-nav";
import { AmbientStage } from "@/components/ui/ambient-stage";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch couple settings and profiles
  const { data: settings } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const isUser1 = user.id === settings?.user1_id;
  const currentUserName = isUser1
    ? settings?.user1_name || "Adjie"
    : settings?.user2_name || "Jeehan";
  const partnerName = isUser1
    ? settings?.user2_name || "Jeehan"
    : settings?.user1_name || "Adjie";

  const startDate = settings?.relationship_start_date || "2024-01-01";

  return (
    <>
      <AmbientStage />
      <AppNav
        currentUserName={currentUserName}
        partnerName={partnerName}
        startDate={startDate}
      />
      <main className="app-shell">{children}</main>
    </>
  );
}
