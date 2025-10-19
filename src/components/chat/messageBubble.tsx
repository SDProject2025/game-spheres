import type { MessageInput } from "@/types/Message";
import { CgCheckO } from "react-icons/cg";
import ClipCard from "../clips/clipCard";
import { useEffect, useState } from "react";
import { Clip } from "@/types/Clip";
import { collection, doc, getDoc, query } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { CLIPS_COLLECTION } from "@/app/api/collections";

type Props = {
  msg: MessageInput;
  isSent: boolean;
  handlePlayVideo: (clip: Clip) => void;
};

export default function MessageBubble({ msg, isSent, handlePlayVideo }: Props) {
  const isClip = msg.type === "clip";
  const [clip, setClip] = useState<Clip | null>(null);

  useEffect(() => {
    if (!isClip) return;

    const getClip = async () => {
      const docRef = doc(db, CLIPS_COLLECTION, msg.content);
      const clipSnap = await getDoc(docRef);
      const clipData = clipSnap.data();
      if (!clipData) return;
      setClip({
        id: clipSnap.id,
        ...clipData,
        uploadedAt: clipData.uploadedAt.toDate(),
      } as Clip);
    };

    getClip();
  }, []);

  return (
    <div
      key={msg.messageId}
      className={`flex flex-col ${
        isSent ? "ml-auto items-end" : "mr-auto items-start"
      } ${isClip ? "max-w-[95%]" : "max-w-[70%]"}`}
    >
      <div
        className={`${
          isClip
            ? "w-full p-0 bg-transparent"
            : "px-3 py-2 whitespace-pre-wrap break-words break-all"
        } ${
          isSent ? "bg-green-700 text-white" : "bg-gray-600 text-white"
        } rounded-2xl`}
      >
        {isClip && clip ? (
          <div
            className={`w-[50%] h-[10%] overflow-hidden rounded-2xl ${
              isSent ? "ml-auto" : "mr-auto"
            }`}
          >
            <ClipCard clip={clip} onPlay={() => handlePlayVideo(clip)}/>
          </div>
        ) : (
          msg.content
        )}
      </div>
      {isSent && (
        <CgCheckO
          className={`${msg.read ? "text-green-400" : "text-gray-400"}`}
        />
      )}

      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {(() => {
          const createdDate = new Date(msg.createdAt);
          const now = new Date();
          const isToday =
            createdDate.getDate() === now.getDate() &&
            createdDate.getMonth() === now.getMonth() &&
            createdDate.getFullYear() === now.getFullYear();

          const isYesterday =
            createdDate.getDate() === now.getDate() - 1 &&
            createdDate.getMonth() === now.getMonth() &&
            createdDate.getFullYear() === now.getFullYear();

          if (isToday) {
            return `Today, ${createdDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          } else if (isYesterday) {
            return `Yesterday, ${createdDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          } else {
            return createdDate.toLocaleString([], {
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        })()}
      </span>
    </div>
  );
}
