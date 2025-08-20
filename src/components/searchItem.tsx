type Props = {
    imageUrl: string;
    searchTitle: string;
}

export default function SearchItem({imageUrl, searchTitle}: Props) {
    return (
        <div className="flex items-center space-x-3">
            <img
                src={imageUrl}
                alt={searchTitle}
                className="w-12 h-12 object-cover rounded"
            />
            <span>{searchTitle}</span>
        </div>
    )
}