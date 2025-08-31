"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { MdPerson, MdEdit } from "react-icons/md";
import NeonButton from "../neonButton";
import TextInput from "../auth/textInput";
import { db } from "@/config/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

type Props = {
  userId: string;
  onSave?: () => void;
};
{/* this page redirects back to profile after save/ cancel - will prob change thisbut it works so im keeping it for nowwwww */}


export default function EditProfileForm({ userId, onSave }: Props) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState(""); // preview only
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setUsername(data.username || "");
        setDisplayName(data.displayName || "");
        setBio(data.bio || "");
        setPhotoURL(data.photoURL || "");
      }
    };
    loadProfile();
  }, [userId]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoURL(URL.createObjectURL(e.target.files[0])); // preview only
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      //TODO: add pfp stuff 
      await updateDoc(doc(db, "users", userId), {
        username,
        displayName,
        bio,
      });

      if (onSave) onSave();
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="relative w-[600px] h-[500px] p-8 rounded-lg shadow-xl text-white bg-black/30 backdrop-blur-md border border-white/10 grid grid-cols-[180px_1fr] gap-6"
      onSubmit={handleSubmit}
    >
      {/* pfp uploads dont store (ui only) */}
      <div className="flex flex-col items-center gap-3">
        <img
          src={photoURL || "/default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border border-white/20"
        />
        <label className="cursor-pointer flex items-center gap-2 text-sm hover:text-green-400">
          <MdEdit /> Change photo
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </label>
      </div>

     
      <div className="flex flex-col gap-4">
        <TextInput
          label="Username"
          icon={<MdPerson />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextInput
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full p-2 rounded-md bg-black/40 border border-white/10 text-white"
          />
        </div>
         
        <div className="flex gap-3 mt-4">
          <NeonButton type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </NeonButton>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 rounded-md bg-gray-500/30 hover:bg-gray-500/50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
