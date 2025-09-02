type Props = {
  imageUrl: string;
  searchTitle: string;
  children?: React.ReactNode;
};

export default function SearchDetails({
  imageUrl,
  searchTitle,
  children,
}: Props) {
  return (
    <>
      <div className="flex items-center mb-6">
        <img
          src={imageUrl}
          alt={searchTitle}
          className="w-20 h-20 rounded-full object-cover mr-5 flex-shrink-0"
        />
        <h2 className="text-3xl font-semibold text-cyan-300">{searchTitle}</h2>
      </div>
      {children}
    </>
  );
}
