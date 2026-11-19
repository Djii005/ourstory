import { createClient } from "@/lib/supabase/server";
import { MultiplayerHub } from "@/components/games/multiplayer-hub";

export default async function MultiplayerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const isUser1 = user?.id === settings?.user1_id;
  const currentUserName = isUser1 ? settings?.user1_name || "Adji" : settings?.user2_name || "Jeehan";
  const partnerName = isUser1 ? settings?.user2_name || "Jeehan" : settings?.user1_name || "Adji";
  const partnerId = isUser1 ? settings?.user2_id || "" : settings?.user1_id || "";

  return (
    <MultiplayerHub
      currentUserId={user?.id || ""}
      partnerId={partnerId}
      currentUserName={currentUserName}
      partnerName={partnerName}
    />
  );
}
