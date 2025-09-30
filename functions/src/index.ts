import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {onSchedule} from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Function triggered when a like is added or removed
export const updateClipPopularity = onDocumentWritten(
  {
    document: "clips/{clipId}/likes/{likeId}",
    region: "africa-south1", // firestore region
  },
  async (event) => {
    const clipId = event.params.clipId;
    const clipRef = db.doc(`clips/${clipId}`);

    try {
      const now = admin.firestore.Timestamp.now();
      const oneDayAgo = new admin.firestore.Timestamp(now.seconds - 86400, 0);
      const oneWeekAgo = new admin.firestore.Timestamp(now.seconds - 604800, 0);
      const oneMonthAgo = new admin.firestore.Timestamp(
        now.seconds - 2592000,
        0
      );

      const likesRef = db.collection(`clips/${clipId}/likes`);

      const [likes24h, likesWeek, likesMonth, totalLikes] = await Promise.all([
        likesRef.where("likedAt", ">=", oneDayAgo).get(),
        likesRef.where("likedAt", ">=", oneWeekAgo).get(),
        likesRef.where("likedAt", ">=", oneMonthAgo).get(),
        likesRef.get(),
      ]);

      await clipRef.update({
        likesLast24h: likes24h.size,
        likesLastWeek: likesWeek.size,
        likesLastMonth: likesMonth.size,
        lastPopularityUpdate: now,
      });

      console.log(`Updated popularity for clip ${clipId}:`, {
        total: totalLikes.size,
        last24h: likes24h.size,
        lastWeek: likesWeek.size,
        lastMonth: likesMonth.size,
      });
    } catch (error) {
      console.error(`Error updating popularity for clip ${clipId}:`, error);
    }
  }
);

export const dailyPopularityUpdate = onSchedule(
  {
    schedule: "0 2 * * *", // Daily at 2 AM (low traffic time)
    timeZone: "Africa/Johannesburg", // Your timezone
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540, // 9 minutes max
    maxInstances: 1,
  },
  async () => {
    console.log("Starting daily popularity update...");

    try {
      const now = admin.firestore.Timestamp.now();
      const oneDayAgo = new admin.firestore.Timestamp(now.seconds - 86400, 0);
      const oneWeekAgo = new admin.firestore.Timestamp(now.seconds - 604800, 0);
      const oneMonthAgo = new admin.firestore.Timestamp(
        now.seconds - 2592000,
        0
      );

      // Process clips in batches to avoid timeouts
      const batchSize = 25;
      let totalUpdated = 0;
      let lastDoc = null;

      let hasMore = true;

      while (hasMore) {
        let query = db.collection("clips").limit(batchSize);

        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }

        const clipsSnapshot = await query.get();

        if (clipsSnapshot.empty) {
          console.log("No more clips to process");
          hasMore = false;
          break;
        }

        const batch = db.batch();
        let batchUpdates = 0;

        for (const clipDoc of clipsSnapshot.docs) {
          const clipId = clipDoc.id;
          const likesRef = db.collection(`clips/${clipId}/likes`);

          try {
            // Use count() queries for efficiency (less data transfer)
            const [likes24h, likesWeek, likesMonth] = await Promise.all([
              likesRef.where("likedAt", ">=", oneDayAgo).count().get(),
              likesRef.where("likedAt", ">=", oneWeekAgo).count().get(),
              likesRef.where("likedAt", ">=", oneMonthAgo).count().get(),
            ]);

            const counts = {
              likesLast24h: likes24h.data().count,
              likesLastWeek: likesWeek.data().count,
              likesLastMonth: likesMonth.data().count,
              lastPopularityUpdate: now,
            };

            // Only update if there's been a significant
            // time gap since last update
            const clipData = clipDoc.data();
            const lastUpdate = clipData.lastPopularityUpdate;
            const timeSinceUpdate = lastUpdate ?
              now.seconds - lastUpdate.seconds :
              86400; // Default to 24h if never updated

            if (timeSinceUpdate > 3600) {
              // Update if > 1 hour since last update
              batch.update(clipDoc.ref, counts);
              batchUpdates++;
            }
          } catch (error) {
            console.error(`Error processing clip ${clipId}:`, error);
          }
        }

        if (batchUpdates > 0) {
          await batch.commit();
          totalUpdated += batchUpdates;
          console.log(`Updated ${batchUpdates} clips in this batch`);
        }

        lastDoc = clipsSnapshot.docs[clipsSnapshot.docs.length - 1];

        // Add a small delay between batches to avoid overwhelming Firestore
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`Daily popularity update of ${totalUpdated} clips total.`);
    } catch (error) {
      console.error("Error in daily popularity update:", error);
    }
  }
);
