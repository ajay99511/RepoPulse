interface StatCardProps {
  label: string;
  value: number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg bg-gray-900 border border-gray-800 px-4 py-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
