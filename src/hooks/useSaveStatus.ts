import { useEffect, useState } from "react";
import { checkSavedStatus, toggleSaveClip } from "@/services/clipsService";

export function useSaveStatus(clipId: string, user: any, initialSaved?: boolean) {
  const [saved, setSaved] = useState(initialSaved);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const data = await checkSavedStatus(user.uid, clipId);
        setSaved(data.isSaved);
      } catch (err) {
        console.error("Error checking saved status:", err);
      }
    })();
  }, [user?.uid, clipId]);

  const toggleSave = async (action: "save" | "unsave") => {
    if (!user?.uid) return;
    try {
      await toggleSaveClip(user.uid, clipId, action);
      setSaved(action === "save");
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  return { saved, toggleSave };
}
