type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function MessageBody({ value, onChange }: Props) {
  return (
    <div className="relative mb-4">
      <textarea
        id="message"
        name="message"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your message"
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}
