"use client";
import { auth } from "@/config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
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

export default function GameSpheres() {
  const [search, setSearch] = useState("");
  const [debounce, setDebounce] = useState(search);
  const [results, setResults] = useState<FullGameSphere[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FullGameSphere | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false); // use for dynamic button text

  const router = useRouter();

  useEffect(() => {
    const checkSub = async () => {
      const user = auth.currentUser;
      if (!user || !selected) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) return;
      const data = snap.data();

      const gsRef = doc(db, "gamespheres", selected.id);

      const subscribed = ((data.gsSubs || []) as DocumentReference[]).some(
        (ref) => ref.path === gsRef.path
      );

      setIsSubscribed(subscribed);
    };
    checkSub();
  }, [selected]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        //user is logged in
        setUserId(user.uid);
      } else {
        // user is signed out - send to login
        router.replace("/");
      }
    });
  }, [router]);

  const handleSubButtonClick = async (
    gameSphereId: string,
    isSubbed: boolean
  ) => {
    if (!userId) {
      router.replace("/");
      return;
    }

    const gsRef = doc(db, "gamespheres", gameSphereId);
    const userRef = doc(db, "users", userId);

    try {
      if (!isSubbed) {
        // subscribe to gamesphere
        const batch = writeBatch(db);

        //update gs subscriber
        batch.update(gsRef, {
          subscribers: arrayUnion(userRef),
        });

        // update user subscription list
        batch.update(userRef, {
          gsSubs: arrayUnion(gsRef),
        });

        // commit batch - atomic update
        // ensures both collections are updated, or none at all - consistency
        await batch.commit();
        setIsSubscribed(true);
        toast.success(`Subscribed to GameSphere ${selected?.name}`);
        console.log(`User ${userId} subscribed to GameSphere ${gameSphereId}`);
      } else {
        // unsub from gamesphere
        await updateDoc(gsRef, {
          subscribers: arrayRemove(userRef),
        });

        //remove gs from users
        await updateDoc(userRef, {
          gsSubs: arrayRemove(gsRef),
        });

        setIsSubscribed(false);
        toast.success(`Unsubscribed from GameSphere ${selected?.name}`);

        console.log(`User ${userId} unsubbed from GameSphere ${gameSphereId}`);
      }
    } catch (error) {
      toast.error("Something went wrong :(");
      console.error("Error updating:", error);
    }
  };

  //update debounce search after 250ms delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounce(search);
    }, 250); //250ms delay

    // clean up - cancels timeout if search term changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    if (debounce.trim() === "") {
      setResults([]);
      setSelected(null);
      return;
    }

    let isCancelled = false;

    if (debounce) {
      const fetchResults = async () => {
        setLoading(true);

        try {
          const gameSpheresRef = collection(
            db,
            "gamespheres"
          ).withConverter<GameSphere>({
            toFirestore: (data) => data,
            fromFirestore: (snap: QueryDocumentSnapshot) =>
              snap.data() as GameSphere,
          });

          const gameSpheresSnap = await getDocs(gameSpheresRef);

          const games: FullGameSphere[] = gameSpheresSnap.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((game) =>
              game.name?.toLowerCase().includes(debounce.toLowerCase())
            );

          if (!isCancelled) setResults(games);

          // Auto-select first result if none selected or if it's not in results
          if (
            games.length > 0 &&
            (!selected || !games.find((g) => g.id === selected.id))
          ) {
            setSelected(games[0]);
          } else if (games.length === 0) {
            setSelected(null);
          }
        } catch (e) {
          console.error("Error fetching GameSpheres", e);
          setResults([]);
          setSelected(null);
        }

        setLoading(false);
      };

      fetchResults();
      return () => {
        isCancelled = true;
      };
    }
  }, [debounce]);

  return (
    <div className="min-h-screen text-white p-6 flex flex-col items-center">
      {/* Main container */}
      <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-lg bg-[#111] transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)]">
        {/* Left sidebar */}
        <div className="w-1/3 bg-[#111111] p-4 border-r border-cyan-500 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">
            Search GameSpheres
          </h2>

          <input
            type="text"
            placeholder="Search for a game..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 px-3 py-2 rounded-lg border border-gray-600 bg-[#222] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          {loading && <p>Loading...</p>}
          {!loading && results.length === 0 && search.trim() !== "" && (
            <p>No results found.</p>
          )}

          <div className="overflow-y-auto flex-1 max-h-[600px] scrollbar-thin pr-1">
            {results.map((game) => (
              <div
                key={game.id}
                className={`mb-2 p-3 rounded-lg cursor-pointer transition-colors duration-200 flex items-center space-x-3 ${
                  selected?.id === game.id
                    ? "bg-cyan-600 text-black font-bold"
                    : "bg-[#222] hover:bg-[#333]"
                }`}
                onClick={() => setSelected(game)}
              >
                {game.coverUrl ? (
                  <img
                    src={game.coverUrl}
                    alt={game.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-xs">
                    No Image
                  </div>
                )}
                <span>{game.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right detail pane */}
        <div className="w-2/3 p-6 flex flex-col justify-center relative">
          {selected ? (
            <>
              <div className="flex items-center mb-6">
                {selected.coverUrl ? (
                  <img
                    src={selected.coverUrl}
                    alt={selected.name}
                    className="w-20 h-20 rounded-full object-cover mr-5 flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-cyan-400 flex items-center justify-center text-black text-4xl mr-5 select-none">
                    {selected.name.charAt(0)}
                  </div>
                )}
                <h2 className="text-3xl font-semibold text-cyan-300">
                  {selected.name}
                </h2>
              </div>

              {selected.releaseDate && (
                <p className="text-gray-400 mb-2">
                  <strong>Released:</strong> {selected.releaseDate}
                </p>
              )}

              {selected.storyline && (
                <p className="text-gray-300 mb-4">{selected.storyline}</p>
              )}

              {selected.genres && selected.genres.length > 0 && (
                <p className="mb-4">
                  <strong>Genres:</strong> {selected.genres.join(", ")}
                </p>
              )}

              <div className="mt-auto flex justify-center">
                <button
                  onClick={() =>
                    handleSubButtonClick(selected.id, isSubscribed)
                  }
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-full transition cursor-pointer"
                >
                  {isSubscribed ? "Unsubscribe" : "Subscribe"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-400 self-center">
              Search and select a game to see details here.
            </p>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
