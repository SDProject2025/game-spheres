type ProfileInfoProps = {
    name: string;
    username: string;
    bio: string;
};

export default function ProfileInfo({name, username, bio}: ProfileInfoProps) {
    return (
        <>
            <h1 className="mt-4 text-2xl font-bold">{name}</h1>
            <h2 className="text-sm text-gray-400 mt-1">{username}</h2>
            <p className="text-center max-w-xs mt-2">{bio}</p>
        </>
    )
}