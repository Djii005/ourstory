import { createClient } from "@/lib/supabase/server";
import { LettersHub } from "@/components/letters/letters-hub";
import { LetterSummary } from "@/types/letters";

export default async function LettersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const { data: lettersData } = await supabase
    .from("letters")
    .select("*")
    .order("created_at", { ascending: false });

  const letters: LetterSummary[] = (lettersData as LetterSummary[]) || [];

  return (
    <LettersHub
      initialLetters={letters}
      currentUserId={user?.id || ""}
      user1Id={settings?.user1_id || ""}
      user2Id={settings?.user2_id || ""}
      user1Name={settings?.user1_name || "Adji"}
      user2Name={settings?.user2_name || "Jeehan"}
    />
  );
}
