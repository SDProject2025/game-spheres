"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/config/userProvider";
import { db } from "@/config/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  arrayUnion,
  arrayRemove,
  updateDoc,
  DocumentReference,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { GameSphere, FullGameSphere } from "@/types/GameSphere";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import SearchBar from "@/components/searchBar";

export default function GameSpheres() {
  const [selectedGame, setSelectedGame] = useState<FullGameSphere | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false); // use for dynamic button text

  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [router]);

  // check sub status
  useEffect(() => {
    const checkSub = async () => {
      if (!user || !selectedGame) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) return;

      const data = snap.data();

      const gsRef = doc(db, "gamespheres", selectedGame.id);

      const subscribed = ((data.gsSubs || []) as DocumentReference[]).some(
        (ref) => ref.path === gsRef.path
      );

      setIsSubscribed(subscribed);
    };
    checkSub();
  }, [selectedGame]);

  // search function to find GameSpheres
  const searchGameSpheres = useCallback(
    async (query: string): Promise<FullGameSphere[]> => {
      try {
        const gsRef = collection(db, "gamespheres").withConverter<GameSphere>({
          toFirestore: (data) => data,
          fromFirestore: (snap: QueryDocumentSnapshot) =>
            snap.data() as GameSphere,
        });

        const gsSnap = await getDocs(gsRef);

        /**
         * This is the actual search. It matches the name
         * of each GameSphere against the search query
         */
        return gsSnap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((game) =>
            game.name.toLowerCase().includes(query.toLowerCase())
          );
      } catch (error) {
        console.error("Error fetching GameSpheres:", error);
        return [];
      }
    },
    []
  );

  // subscribe / unsubscribe
  const handleSubButtonClicked = async (gameSphere: FullGameSphere) => {
    if (!user) {
      router.replace("/");
      return;
    }

    const gsRef = doc(db, "gamespheres", gameSphere.id);
    const userRef = doc(db, "users", user.uid);

    try {
      if (!isSubscribed) {
        // subscribe to gs
        const batch = writeBatch(db);

        batch.update(gsRef, {
          subscribers: arrayUnion(userRef),
        });

        batch.update(userRef, {
          gsSubs: arrayUnion(gsRef),
        });

        await batch.commit();

        setIsSubscribed(true);
        toast.success(`Subscribed to GameSphere ${gameSphere.name}`);
      } else {
        // unsubscribe
        await updateDoc(gsRef, {
          subscribers: arrayRemove(userRef),
        });

        await updateDoc(userRef, {
          gsSubs: arrayRemove(gsRef),
        });

        setIsSubscribed(false);
        toast.success(`Unsubscribed from GameSphere ${gameSphere.name}`);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Something went wrong :(");
    }
  };

  // REnder item for GameSphere items in the list returned after searching
  const renderGameItem = (game: FullGameSphere, isSelected: boolean) => (
    <div className="flex items-center space-x-3">
      <img
        src={game.coverUrl}
        alt={game.name}
        className="w-12 h-12 object-cover rounded"
      />
      <span>{game.name}</span>
    </div>
  );

  // Render details for game selected from search list
  const renderGameDetails = (game: FullGameSphere) => (
    <>
      <div className="flex items-center mb-6">
        <img
          src={game.coverUrl}
          alt={game.name}
          className="w-20 h-20 rounded-full object-cover mr-5 flex-shrink-0"
        />
        <h2 className="text-3xl font-semibold text-cyan-300">{game.name}</h2>
      </div>

      {game.releaseDate && (
        <p className="text-gray-400 mb-2">
          <strong>Released:</strong> {game.releaseDate}
        </p>
      )}

      {game.storyline && <p className="text-gray-300 mb-4">{game.storyline}</p>}

      {game.genres && game.genres.length > 0 && (
        <p className="mb-4">
          <strong>Genres:</strong> {game.genres.join(", ")}
        </p>
      )}
    </>
  );

  // function to update which game is selected based on search list
  const handleSelection = useCallback((game: FullGameSphere | null) => {
    setSelectedGame(game);
  }, []);

  return (
    <>
      {/* Match Props from searchBar.tsx */}
      <SearchBar
        placeholder="Search for a game ..."
        title="Search GameSpheres"
        searchFunction={searchGameSpheres}
        renderItem={renderGameItem}
        renderDetails={renderGameDetails}
        onItemAction={handleSubButtonClicked}
        actionButtonText={(game) =>
          isSubscribed ? "Unsubscribe" : "Subscribe"
        }
        onSelectionChange={handleSelection}
      />
      <Toaster />
    </>
  );
}
