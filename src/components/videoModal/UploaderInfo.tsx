import { useRouter } from "next/navigation";

interface UserInfo {
  displayName: string;
  username: string;
  photoURL: string;
  uid: string;
}

interface Props {
  uploader: UserInfo | null;
  uploadedAt: Date;
}

export default function UploaderInfo({ uploader, uploadedAt }: Props) {
  const router = useRouter();
  return (
    <div className="flex items-center mb-4 pb-4 border-b border-gray-700">
      {uploader?.photoURL && (
        <img
          src={uploader.photoURL}
          alt={uploader.displayName || uploader.username || "User"}
          className="w-10 h-10 rounded-full object-cover mr-2"
        />
      )}
      <div>
        <p
          className="font-semibold text-white cursor-pointer"
          onClick={() => {
            router.push(`/profile/${uploader?.uid}`);
          }}
        >
          {uploader?.displayName}
        </p>
        <p className="text-sm text-gray-400">
          Uploaded At: {uploadedAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
