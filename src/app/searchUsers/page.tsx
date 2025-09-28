"use client";
import SearchBar, { SearchItem } from "@/components/search/searchBar";
import SearchItemContainer from "@/components/search/searchItem";
import UserDetail from "@/components/profile/forms/userDetail";

interface User extends SearchItem {
  uid: string;
  photoURL: string;
  username: string;
  displayName: string;
  bio: string;
  followers: string[];
  following: string[];
  conversations: string[];
  messages: string[];
  posts: number;
}

async function searchWithQuery(query: string) {
  try {
    const users: User[] = [];
    const res = await fetch(`/api/profile/search?query=${query}`);
    const data = await res.json();
    for (const user of data.users) users.push(user);
    console.log(users);
    return users;
  } catch (e: unknown) {
    console.error("Error searching:", e);
    return [];
  }
}

const renderSearchItem = (user: User, isSelected: boolean) => (
  <SearchItemContainer searchTitle={user.username} imageUrl={user.photoURL} />
);

const renderSearchDetails = (user: User) => <UserDetail profile={user} />;

export default function searchUsers() {
  return (
    <>
      <SearchBar
        placeholder="Search for other users..."
        title="Search Users"
        renderItem={renderSearchItem}
        renderDetails={renderSearchDetails}
        searchFunction={searchWithQuery}
      />
    </>
  );
}
