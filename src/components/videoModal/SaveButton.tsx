import { Bookmark, BookmarkCheck } from "lucide-react";

export default function SaveButton({
  saved,
  onClick,
}: {
  saved: boolean;
  onClick: (action: "save" | "unsave") => void;
}) {
  return saved ? (
    <BookmarkCheck
      className="cursor-pointer text-[#00ffd5]"
      onClick={() => onClick("unsave")}
    />
  ) : (
    <Bookmark
      className="cursor-pointer text-[#00ffd5]"
      onClick={() => onClick("save")}
    />
  );
}
