import { createClient } from "@/lib/supabase/server";
import { ExtrasHub } from "@/components/extras/extras-hub";
import { BucketItem, DailyQuestion, DailyAnswer } from "@/types/extras";

export default async function ExtrasPage() {
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

  // 1. Fetch Bucket Items
  const { data: bucketData } = await supabase
    .from("bucket_items")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Fetch today's question
  const todayDateStr = new Date().toISOString().split("T")[0];
  const { data: todayQuestionData } = await supabase
    .from("daily_questions")
    .select("*")
    .eq("question_date", todayDateStr)
    .maybeSingle();

  // 3. Fetch answers for today's question (Postgres RLS filters partner's answer if user hasn't answered)
  let answersData: DailyAnswer[] = [];
  if (todayQuestionData) {
    const { data: answers } = await supabase
      .from("daily_answers")
      .select("*")
      .eq("daily_question_id", todayQuestionData.id);

    answersData = (answers as DailyAnswer[]) || [];
  }

  return (
    <ExtrasHub
      bucketItems={(bucketData as BucketItem[]) || []}
      todayQuestion={todayQuestionData as DailyQuestion | null}
      todayAnswers={answersData}
      currentUserId={user?.id || ""}
      partnerId={partnerId}
      currentUserName={currentUserName}
      partnerName={partnerName}
    />
  );
}
