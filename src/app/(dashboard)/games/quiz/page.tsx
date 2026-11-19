import { createClient } from "@/lib/supabase/server";
import { QuizArena, QuizQuestionItem } from "@/components/games/quiz-arena";

export default async function QuizPage() {
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

  // 1. Fetch questions
  const { data: questionsData } = await supabase
    .from("quiz_questions")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Fetch all answers for these questions
  const { data: answersData } = await supabase
    .from("quiz_answers")
    .select("*");

  const answersMap = new Map<string, { selected_option_index: number; is_correct: boolean }>();
  answersData?.forEach((ans) => {
    answersMap.set(`${ans.question_id}_${ans.user_id}`, {
      selected_option_index: ans.selected_option_index,
      is_correct: ans.is_correct,
    });
  });

  const parsedQuestions: QuizQuestionItem[] = (questionsData || []).map((q) => {
    const ansKey = `${q.id}_${user?.id}`;
    return {
      ...q,
      options: q.options as string[],
      answer: answersMap.get(ansKey) || null,
    };
  });

  return (
    <QuizArena
      initialQuestions={parsedQuestions}
      currentUserId={user?.id || ""}
      partnerId={partnerId}
      currentUserName={currentUserName}
      partnerName={partnerName}
    />
  );
}
