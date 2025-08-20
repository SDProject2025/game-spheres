import SearchBar from "@/components/search/searchBar";
import SearchItem from "@/components/search/searchItem";
import SearchDetails from "@/components/search/searchDetails";

interface User {
  profileUrl: string;
  username: string;
  displayName: string;
  bio: string;
  followers: string[];
  following: string[];
  posts: string[];
}

const renderUserItem = (user: User) => (
  <SearchItem imageUrl={user.profileUrl} searchTitle={user.username} />
);

const renderUserDetails = (user: User) => (
  <SearchDetails
    imageUrl={user.profileUrl}
    searchTitle={user.username}
  >
    {user.bio && <p className="text-gray-300">{user.bio}</p>}
  </SearchDetails>
);

export default function UserSearch() {
  return <></>;
}
