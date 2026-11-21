import { createClient } from "@/lib/supabase/server";
import { LiveCounter } from "@/components/tracker/live-counter";
import { Countdowns } from "@/components/tracker/countdowns";
import { MilestoneBadges } from "@/components/tracker/milestone-badges";
import { TimelineMoments, TimelineMoment } from "@/components/tracker/timeline-moments";

export default async function TrackerHomePage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const { data: momentsData } = await supabase
    .from("timeline_moments")
    .select("*")
    .order("event_date", { ascending: false });

  const startDate = settings?.relationship_start_date || "2024-01-01";
  const partner1 = settings?.user1_name || "Adji";
  const partner2 = settings?.user2_name || "Jeehan";
  const moments: TimelineMoment[] = momentsData || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <LiveCounter
        startDate={startDate}
        partner1={partner1}
        partner2={partner2}
      />

      <Countdowns
        startDate={startDate}
        user1Birthday={settings?.user1_birthday}
        user2Birthday={settings?.user2_birthday}
        partner1Name={partner1}
        partner2Name={partner2}
      />

      <MilestoneBadges startDate={startDate} />

      <TimelineMoments initialMoments={moments} />
    </div>
  );
}
