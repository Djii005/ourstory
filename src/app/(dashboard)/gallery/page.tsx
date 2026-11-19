import { createClient } from "@/lib/supabase/server";
import { GalleryHub } from "@/components/gallery/gallery-hub";
import { PhotoRecord } from "@/types/gallery";

export default async function GalleryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: photosData } = await supabase
    .from("photos")
    .select("*")
    .order("taken_at", { ascending: false });

  const rawPhotos: PhotoRecord[] = (photosData as PhotoRecord[]) || [];

  let photosWithUrls = [...rawPhotos];
  if (rawPhotos.length > 0) {
    const paths = rawPhotos.slice(0, 30).map((p) => p.storage_path);
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

  return (
    <GalleryHub
      initialPhotos={photosWithUrls}
      currentUserId={user?.id || ""}
    />
  );
}
