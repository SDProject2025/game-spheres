type Props = {
  stat: number,
  type: string,
}

export default function ProfileStat({stat, type} : Props) {
  return (
    /* follows info idk if we should have likes as well or gamespheres followed */
    <div className="text-center">
        <p className="font-bold text-lg">{stat}</p>
        <p className="text-gray-400 text-sm">{type}</p>
    </div>
  );
}