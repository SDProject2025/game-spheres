type Props = {
  stat: number;
  type: string;
  onClick?: () => void;
};

export default function ProfileStat({ stat, type, onClick }: Props) {
  return (
    <div 
      className={`text-center ${onClick ? 'cursor-pointer hover:text-[#00ffc3] transition-colors' : ''}`}
      onClick={onClick}
    >
      <p className="font-bold text-lg">{stat}</p>
      <p className="text-gray-400 text-sm">{type}</p>
    </div>
  );
}