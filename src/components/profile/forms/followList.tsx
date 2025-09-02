import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

interface FollowListProps {
  type: "followers" | "following";
  count: number;
  isOpen: boolean;
  onClose: () => void;
  onFetchData: (type: "followers" | "following") => Promise<User[]>;
  renderButton?: (user: User) => React.ReactNode; // new
}

export default function FollowList({
  type,
  count,
  isOpen,
  onClose,
  onFetchData,
  renderButton,
}: FollowListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && count > 0) {
      fetchUsers();
    }
  }, [isOpen, type]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await onFetchData(type);
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = type === "followers" ? "Followers" : "Following";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white text-lg font-semibold">
            {title} ({count})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-80">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">{error}</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No {type} yet</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {users.map((user) => (
                <div className="flex">
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`} // adjust route if needed
                    onClick={onClose} // close modal on click
                    className="p-4 flex items-center gap-3 hover:bg-[#222] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#333] overflow-hidden">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.displayName}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.displayName}</p>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                    </div>
                  </Link>
                  {renderButton && renderButton(user)}
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
