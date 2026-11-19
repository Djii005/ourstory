import { createClient } from "@/lib/supabase/server";
import { LetterEditor } from "@/components/letters/letter-editor";

export default async function NewLetterPage() {
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
  const partnerId = isUser1 ? settings?.user2_id : settings?.user1_id;
  const partnerName = isUser1 ? settings?.user2_name || "Jeehan" : settings?.user1_name || "Adji";

  return (
    <LetterEditor
      currentUserId={user?.id || ""}
      partnerId={partnerId || ""}
      partnerName={partnerName}
    />
  );
}
