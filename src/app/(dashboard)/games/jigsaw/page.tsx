import { createClient } from "@/lib/supabase/server";
import { JigsawLauncher } from "@/components/games/jigsaw-launcher";
import { PhotoRecord } from "@/types/gallery";
import { JigsawRecord } from "@/types/games";

export default async function JigsawPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch gallery photos for jigsaw
  const { data: photosData } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(16);

  const rawPhotos: PhotoRecord[] = (photosData as PhotoRecord[]) || [];
  let photosWithUrls = [...rawPhotos];

  if (rawPhotos.length > 0) {
    const paths = rawPhotos.map((p) => p.storage_path);
    const { data: signedData } = await supabase.storage
      .from("photos")
      .createSignedUrls(paths, 3600);

    if (signedData) {
      const urlMap = new Map<string, string>();
      signedData.forEach((s) => {
        if (s.signedUrl && s.path) urlMap.set(s.path, s.signedUrl);
      });
      photosWithUrls = rawPhotos.map((p) => ({
        ...p,
        signed_url: urlMap.get(p.storage_path),
      }));
    }
  }

  // 2. Fetch top jigsaw records
  const { data: recordsData } = await supabase
    .from("jigsaw_records")
    .select("*")
    .order("time_seconds", { ascending: true })
    .limit(10);

  const records: JigsawRecord[] = (recordsData as JigsawRecord[]) || [];

  return (
    <JigsawLauncher
      galleryPhotos={photosWithUrls}
      topRecords={records}
      currentUserId={user?.id || ""}
    />
  );
}
