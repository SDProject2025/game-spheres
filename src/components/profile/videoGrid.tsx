import { HiMiniPlay } from "react-icons/hi2";

export default function VideoGrid({ posts }: { posts: {id: number; thumbnail: string}[] }) {
    return (
        <>
            {/* videogrid which is like 16:9 aspect ratio for preview- grid column amount would have to depemd onn videos posted */}
            {posts.map((post) => (
                <div key={post.id} className="relative aspect-[9/16] overflow-hidden">
                    <img
                        src={post.thumbnail}
                        alt="hm"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                        <HiMiniPlay className="w-8 h-8" />
                    </div>
                </div>
            ))}
        </>
    );
}